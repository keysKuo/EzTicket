const fetch = require('node-fetch');

module.exports.exchange = async (from, to, amount) => {
    return await fetch(`https://open.er-api.com/v6/latest/${from}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();
        if(result.result == 'success') {
            let rate = result.rates[to];
            return {
                success: true,
                data: amount * rate
            }
        }
        
        return {
            success: false,
        }
    })
    .catch(err => {
        return {
            success: false,
            err
        }
    })
}