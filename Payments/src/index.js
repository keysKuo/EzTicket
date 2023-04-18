require('dotenv').config();
const PORT = process.env.PAYMENT_PORT || 4000;
// const router = require('./resources/routes');
const app = require('./config/server').init();
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

app.get('/', async (req, res, next) => {
    res.sendFile('index.html', {root: __dirname })
});

app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:4000/success",
          "cancel_url": "http://localhost:4000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Redhock Bar Soap",
                  "sku": "001",
                  "price": "25.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "25.00"
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
            res.redirect(payment.links[i].href);
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
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
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
