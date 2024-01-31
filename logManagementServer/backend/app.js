const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const indexRouter = require('./routes/index');
const logsRouter = require('./routes/logs');
const {initJobScheduler} = require('./jobs/index')

const app = express();


const dbName = "info"
const uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('conectado a mongodb')) 
  .catch(e => console.log('error de conexión', e))



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");    
  next();
});

app.use('/', indexRouter);
app.use('/logs', logsRouter);

initJobScheduler(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/agenda`);

module.exports = app;
