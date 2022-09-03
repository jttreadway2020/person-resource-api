// API
      const express = require('express');
      const app = express();
      app.use(express.json());


// LISTEN
      const thePORT = process.env.PORT || '3000'
      app.listen(thePORT, ()=> {
            console.log('TESTING !@#');
      //console.log(`webserver running on ${thePORT}`);
      })

// PARSE 
      const bodyParser = require('body-parser'); 
      app.use(bodyParser.json());

// ALLOWING ALL ORIGIN REQUESTS
      app.use(function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            next();
      });

// KNEX
      const knex = require('knex');
            
      //Heroku connect
      const db = knex({
            client: 'pg',
            connection: {
                  connectionString: process.env.DATABASE_URL,
                  //ssl: {rejectUnathorized}
            }
      });


      // const db = knex({
      //       client: 'pg',

      //       connection: {
      //             host: '127.0.0.1',
      //             user: 'postgres',
      //             password: 'test',
      //             database: 'person-resource1'
      //       }
      // });

// TEST
      // db.select('*').from('address').then(data => {
      //       console.log(data);
      // })

// GET TEST 
      app.get('/', (req, res) => { 
      //res.send('test')  //<--for text
      res.json('test from server')  //<--for json
      })


// POST - REGISTER                              
      app.post('https://person-resource-api.herokuapp.com/register', (req, res) => {

      const { firstName, lastName, street, city, zipCode, state, country } = req.body;

      console.log('Req Body -->' + req.body)
      db.transaction(trx => {
            trx.insert({
                  first_name: firstName,
                  last_name: lastName,
                  entry_date: new Date()
            }).into('persons')
            .returning('*')     
            .then(retPerson => {      // <--PERSONS TBL
                  //.json('testing within transaction')
                  return trx('address')
      
            .returning('*')
            .insert({
                  persons_id: retPerson[retPerson.length - 1].persons_id,
                  street: street,
                  city: city,
                  state: state,
                  zip_code: zipCode,
                  country: country
            })                                            
            .then(addressRecord => {                       
            const combinedTBLs = retPerson.concat(addressRecord);
            res.json(combinedTBLs)                   
            }) 
            .catch(err => res.status(400).json('Unable to reg user' + err))   
                  
            })
            .then(trx.commit)
            .catch(trx.rollback)
      })
      .catch(err => res.status(400).json(err))
      })


// GET BY ID (ID 164 = Test Case)
      app.get('https://person-resource-api.herokuapp.com/person/:id', (req, res) => {
            const { id } = req.params;
            
            db.from('persons')
            .innerJoin('address', 'persons.persons_id', 'address.persons_id')
            .where('persons.persons_id', '=', id)                                
            .then(joinedData => {
                  res.json(joinedData);
            })
      })

// PUT
      // app.put('https://person-resource-api.herokuapp.com/update/person', (req, res) => {
      //   const { id } = req.body;
      //   db('persons').where('persons_id', '=', id)
      //   .returning('*')
      //   .then(data => {
      //         res.json(data);
      //   })
      //   .catch(err => res.status(400).json('unable to get entries'))
      // })

//DELETE
      // app.delete('https://person-resource-api.herokuapp.com/delete/addresses', (req, res) => {
      //   db('persons')
      //   .where('persons_id', 4)
      //   .join('address', 'address.persons_id', 'persons.persons_id')
      //   .del()
      // })

