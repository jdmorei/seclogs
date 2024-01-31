import { WalletServer, Seed, AddressWallet } from "cardano-wallet-js";
const Blockfrost = require("@blockfrost/blockfrost-js");
import * as CardanoWasm from "@emurgo/cardano-serialization-lib-nodejs";
import dotenv from "dotenv";
import { mnemonicToEntropy } from "bip39";

dotenv.config();

class CardanoAPI {
  constructor(passphrase = "dracsc-test") {
    this.api = null;
    this.passphrase = passphrase;
    this.serverAddress = [
      new AddressWallet(process.env.CARDANO_SERVER_ADDRESS),
    ];
    this.wallet = null;
    this.lovelaceQuantity = [0]; // auto
    this.blockfrost = new Blockfrost.BlockFrostAPI({
      projectId: "preproduy4962sl1c9RHV4Z3XgNjwC8zCG1dlEQ", // see: https://blockfrost.io
      network: "preprod",
    });
    this.walletId = null;
    this.blockfrostConfig = {};
  }

  async initCardano() {
    try {
      this.api = WalletServer.init(`${process.env.CARDANO_NODE}/v2`);
      console.log("getNetworkInfo");
      console.log(await this.api.getNetworkInformation());
      this.blockfrostConfig = await this.initBlockfrost();
      await this.createOrRestoreWallet();
    } catch (e) {
      console.log(e);
    }
  }

  async createOrRestoreWallet() {
    const wallets = await this.api.wallets();

    try {
      //const recoveryPhrase = Seed.generateRecoveryPhrase();
      const recoveryPhrase =
        "spawn define swift minimum burst couple pig tray glad penalty elevator symptom trophy ride whisper";
      const mnemonic_sentence = Seed.toMnemonicList(recoveryPhrase);
      const name = "dracsc-wallet";

      this.wallet = await this.api.createOrRestoreShelleyWallet(
        name,
        mnemonic_sentence,
        this.passphrase
      );
      console.log("available", this.wallet.getAvailableBalance());
      let addresses = await this.wallet.getAddresses();
      console.log("addresses", addresses);
    } catch (e) {
      const regex = /\w{40}/gm;

      const found = e.response.data.message.match(regex);
      if (wallets.length > 1) {
        for (let wallet of wallets) {
          if (wallet.id !== found[0]) {
            await wallet.delete();
          }
        }
      }
      this.wallet = wallets[0];

      let addresses = await this.wallet.getAddresses();
      console.log("my wallet", this.wallet.getAvailableBalance());

      this.walletId = addresses[0].id;

      console.log(this.walletId);

      const addressBlockfrost = await this.blockfrost.addresses(this.walletId);

      console.log("blockfrost", addressBlockfrost.amount);
    }
  }

  async writeLog(text) {
    try {
      let metadata = [text];
      let transaction = await this.wallet.sendPayment(
        this.passphrase,
        this.serverAddress,
        this.lovelaceQuantity,
        metadata
      );
      return transaction;
    } catch (e) {
      console.log(e);
    }
  }

  harden(num) {
    return 0x80000000 + num;
  }

  async initBlockfrost() {
    const recoveryPhrase =
      "spawn define swift minimum burst couple pig tray glad penalty elevator symptom trophy ride whisper";

    const entropy = mnemonicToEntropy(recoveryPhrase);

    const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, "hex"),
      Buffer.from("")
    );

    const networkId = CardanoWasm.NetworkInfo.testnet_preprod().network_id();

    const accountIndex = 0;
    const addressIndex = 0;

    const accountKey = rootKey
      .derive(this.harden(1852)) // purpose
      .derive(this.harden(1815)) // coin type
      .derive(this.harden(accountIndex)); // account #

    const utxoKey = accountKey
      .derive(0) // external
      .derive(addressIndex);

    const stakeKey = accountKey
      .derive(2) // chimeric
      .derive(0)
      .to_public();

    const baseAddress = CardanoWasm.BaseAddress.new(
      networkId,
      CardanoWasm.StakeCredential.from_keyhash(
        utxoKey.to_public().to_raw_key().hash()
      ),
      CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
    );

    const address = baseAddress.to_address().to_bech32();

    // Retrieve protocol parameters
    const protocolParams = await this.blockfrost.epochsLatestParameters();

    // Retrieve utxo for the address
    let utxo = [];
    try {
      utxo = await this.blockfrost.addressesUtxosAll(address);
    } catch (error) {
      console.log(error);
      utxo = [];
    }

    if (utxo.length === 0) {
      console.log(
        `You should send ADA to ${address} to have enough funds to sent a transaction`
      );
    }

    utxo = utxo.sort((a, b) => b.amount[0].quantity - a.amount[0].quantity);

    return {
      address,
      utxo,
      protocolParams,
      utxoKey,
    };
  }


  async writeLogBlockfrost(hash) {
    try {
      this.blockfrost = new Blockfrost.BlockFrostAPI({
        projectId: process.env.BLOCKFROST_PROJECT_ID, // see: https://blockfrost.io
        network: process.env.BLOCKFROST_NETWORK,
      });

      this.blockfrostConfig = await this.initBlockfrost();
      const protocolParams = await this.blockfrost.epochsLatestParameters();

      // Get current blockchain slot from latest block
      const latestBlock = await this.blockfrost.blocksLatest();
      const currentSlot = latestBlock.slot;
      // Derive an address (this is the address where you need to send ADA in order to have UTXO to actually make the transaction)
      // Prepare transaction
      const { txBody, auxData } = await this.composeTransaction(
        this.blockfrostConfig.address,
        this.serverAddress[0].id,
        "200000000",
        this.blockfrostConfig.utxo,
        {
          protocolParams,
          currentSlot,
        },
        hash
      );

      // Sign transaction
      const transaction = await this.signTransaction(
        txBody,
        this.blockfrostConfig.utxoKey.to_raw_key(),
        auxData
      );

      // Push transaction to network
      // txSubmit endpoint returns transaction hash on successful submit
      const txHash = await this.blockfrost.txSubmit(transaction.to_bytes());

      return {
        id: txHash,
        hash: hash,
      };
    } catch (error) {}
  }

  sortUtxos(utxos) {
    // returns array sorted from largest lovelace amount to smallest
    return utxos.sort((a, b) => {
      const amountA = CardanoWasm.BigNum.from_str(
        a.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0"
      );
      const amountB = CardanoWasm.BigNum.from_str(
        b.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0"
      );
      return amountB.compare(amountA);
    });
  }

  async composeTransaction(
    address,
    outputAddress,
    outputAmount,
    utxos,
    params,
    hash
  ) {
    try {
      if (!utxos || utxos.length === 0) {
        throw Error(`No utxo on address ${address}`);
      }

      const txBuilder = CardanoWasm.TransactionBuilder.new(
        CardanoWasm.TransactionBuilderConfigBuilder.new()
          .fee_algo(
            CardanoWasm.LinearFee.new(
              CardanoWasm.BigNum.from_str(
                params.protocolParams.min_fee_a.toString()
              ),
              CardanoWasm.BigNum.from_str(
                params.protocolParams.min_fee_b.toString()
              )
            )
          )
          .pool_deposit(
            CardanoWasm.BigNum.from_str(params.protocolParams.pool_deposit)
          )
          .key_deposit(
            CardanoWasm.BigNum.from_str(params.protocolParams.key_deposit)
          )
          // coins_per_utxo_size is already introduced in current Cardano fork
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .coins_per_utxo_byte(
            CardanoWasm.BigNum.from_str(
              params.protocolParams.coins_per_utxo_size
            )
          )
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .max_value_size(parseInt(params.protocolParams.max_val_size))
          .max_tx_size(params.protocolParams.max_tx_size)
          .build()
      );

      const outputAddr = CardanoWasm.Address.from_bech32(outputAddress);
      const changeAddr = CardanoWasm.Address.from_bech32(address);

      // Set TTL to +2h from currentSlot
      // If the transaction is not included in a block before that slot it will be cancelled.
      const ttl = params.currentSlot + 7200;
      txBuilder.set_ttl(ttl);

      // Add output to the tx

      txBuilder.add_output(
        CardanoWasm.TransactionOutputBuilder.new()
          .with_address(outputAddr)
          .next()
          .with_value(
            CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(outputAmount))
          )
          .build()
      );

      // Filter out multi asset utxo to keep this simple
      const lovelaceUtxos = utxos.filter(
        (u) => !u.amount.find((a) => a.unit !== "lovelace")
      );

      // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
      const unspentOutputs = CardanoWasm.TransactionUnspentOutputs.new();
      for (const utxo of lovelaceUtxos) {
        const amount = utxo.amount.find((a) => a.unit === "lovelace")?.quantity;

        if (!amount) continue;

        const inputValue = CardanoWasm.Value.new(
          CardanoWasm.BigNum.from_str(amount.toString())
        );

        const input = CardanoWasm.TransactionInput.new(
          CardanoWasm.TransactionHash.from_bytes(
            Buffer.from(utxo.tx_hash, "hex")
          ),
          utxo.output_index
        );
        const output = CardanoWasm.TransactionOutput.new(
          changeAddr,
          inputValue
        );
        unspentOutputs.add(
          CardanoWasm.TransactionUnspentOutput.new(input, output)
        );
      }

      txBuilder.add_inputs_from(
        unspentOutputs,
        CardanoWasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset
      );

      //add metadata

      // const auxData = undefined

      const generalTxMeta = CardanoWasm.GeneralTransactionMetadata.new();
      const auxData = CardanoWasm.AuxiliaryData.new();
      generalTxMeta.insert(
        CardanoWasm.BigNum.from_str("0"),
        CardanoWasm.encode_json_str_to_metadatum(JSON.stringify(hash), 0)
      );

      auxData.set_metadata(generalTxMeta);
      txBuilder.set_auxiliary_data(auxData);

      // Adds a change output if there are more ADA in utxo than we need for the transaction,
      // these coins will be returned to change address
      txBuilder.add_change_if_needed(changeAddr);

      // Build transaction
      const txBody = txBuilder.build();
      const txHash = Buffer.from(
        CardanoWasm.hash_transaction(txBody).to_bytes()
      ).toString("hex");

      return {
        txHash,
        txBody,
        auxData,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async signTransaction(txBody, signKey, auxData) {
    const txHash = CardanoWasm.hash_transaction(txBody);
    const witnesses = CardanoWasm.TransactionWitnessSet.new();
    const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));

    witnesses.set_vkeys(vkeyWitnesses);

    const transaction = CardanoWasm.Transaction.new(txBody, witnesses, auxData);

    return transaction;
  }
}

export default new CardanoAPI();
