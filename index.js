require('dotenv').config()
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const cors = require('cors')
const VoucherifyClient = require('voucherify');

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine','ejs')

app.get('/',(req,res) =>{
    res.render('index.ejs')
})

const voucherify = VoucherifyClient({
    
    applicationId: process.env.APPLICATION_ID,
    clientSecretKey: process.env.SECRET_KEY,
    apiUrl: 'https://as1.api.voucherify.io'
});

app.post("/checkout",async (req,res)=>{
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
            price_data: {
                currency: 'inr',
                product_data:{
                    name:'Node.js and Express Book'
                },
                unit_amount: 500 * 100
            },
            quantity: 1
        },
        {
            price_data: {
                currency: 'inr',
                product_data:{
                    name:'JavaScript T-Shirt'
                },
                unit_amount: 200 * 100
            },
            quantity: 2
        }
    ],
        mode: 'payment',
        shipping_address_collection:{
            allowed_countries: ["US", "BR", "IN"]
        },
        success_url:`${process.env.BASE_URL}/complete`,
        cancel_url:`${process.env.BASE_URL}/cancel`
    })
    res.redirect(session.url)
})

app.post("/voucher",(req,res) =>{
    const validationParams = {
        voucher: req.body.coupon,
        order: {
            amount: 900 * 100 // Amount in cents, e.g., 9000.00
        }
    };
    
    voucherify.validations.validate(validationParams)
        .then(function(result) {
            // console.log('Validation result:', result);
            voucherify.redemptions.redeem(req.body.coupon, {
                order: {
                    amount: 900 * 100 // Order amount in cents, 9000.00 in this example.
                }
            })
            .then(result => console.log('Redemption successful:', result))
            .catch(err => console.error('Redemption failed:', err));
            // Process validation result here
        })
        .catch(function(error) {
            console.error('Failed to validate coupon:', error);
        });
    console.log(req.body.coupon);
})

app.get("/complete",(req,res) =>{
    res.send("Your payment was successful")
})

app.get("/cancel",(req,res)=>{
    res.redirect("/")
})
app.listen(3000,()=> console.log("Server started on port 3000"))