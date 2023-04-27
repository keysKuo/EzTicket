require('dotenv').config();
const PORT = process.env.PAYMENT_PORT || 4000;
// const router = require('./resources/routes');
const app = require('./config/server').init();
const fetch = require('node-fetch');
const { exchange } = require('./resources/utils');
const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

app.get('/', async (req, res, next) => {
    res.sendFile('index.html', {root: __dirname })
});

app.get('/convert', async (req, res, next) => {
    await fetch('https://open.er-api.com/v6/latest/VND', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();
        if(result.result == 'success') {
            let rate = result.rates['USD']
            console.log('VND -> USD : ' + 230000 + 'VND -> ' + 230000 * rate + "$");
        }
        return res.json(result);
    })
})

app.post('/pay', async (req, res) => {
    let data = req.body;

    let amount = await exchange('VND', 'USD', 300000)
        .then(result => {
            if(result.success) {
                return result.data.toFixed(2).toString();
            }
        })
        .catch(err => {
            return res.status(500).json({success: false});
        })

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": `http://localhost:4000/success`,
          "cancel_url": "http://localhost:4000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Redhock Bar Soap",
                  
                  "price": amount,
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": amount
          },
          "description": "Washing Bar soap"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        // return res.json(payment);
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            return res.status(200).json({url: payment.links[i].href})
            // res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
    };
  
  // Obtains the transaction details from paypal
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          return res.json(payment)
      }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
