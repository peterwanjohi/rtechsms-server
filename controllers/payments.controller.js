const db = require("../models");
const UserModel = db.auth;
const PaymentsModel = db.payments;
const PlanModel = db.plan;
const OrganizationModel = db.organization;
const UnitPaymentsModel = db.unitpayments;

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host:process.env.MAILERHOST,
  port: process.env.MAILERPORT,
  secure: true,
  auth: {
      user: process.env.MAILERUSERNAME,
      pass: process.env.MAILERPASSWORD
  }
});

const {calculateNextPayment} = require("../helpers/Helper");

exports.readController = (req, res) => {
    const organization = req.user.organization;
    PaymentsModel.findOne({where:{organization: organization}}).then((payment) => {
        if ( !payment) {
            return res.status(400).json({
                error: 'Payment not found'
            });
        };

        res.json(payment);
    });
};

exports.readAllController = (req, res) => {
    const organization = req.user.organization;
    PaymentsModel.findAll({where:{organization: organization}}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No Payments made.'
            });
        };

        res.json(payments);
    });
};


exports.paymentController = (req, res) => {
    const {amount, planname, mpesaCode} = req.body;
    const uid= req.user.id;
    const paydate = new Date();
    const time = new Date(paydate).getTime();

    UserModel.findByPk(uid).then(user => {
        if ( !user) {
            return res.status(400).json({
                error: 'Admin not found'
            });
        }
             else {

                console.log("planname: "+planname)
                
            PlanModel.findOne({where:{name: planname}}).then(async plan=>{
                if(!plan) return res.status(400).json({error: "Plan not found!"});

                let payment = {
                    organization: req.user.organization,
                    amount: amount,
                    date: paydate,
                    time: time,
                    plan:planname,
                    type: "Subscription",
                    state: "pending"
                };

                 PaymentsModel.create(payment).then(paymnt => {
                    var mailOptions ={
                        from: req.user.email,
                        to: process.env.FROM,
                        subject: 'New Subscription.',
                        html: `
                                  <h1>${req.user.firstname} ${req.user.last}</h1>
                                  <p>A payment of Ksh ${amount} has been made by the above named on behalf of ${req.user.organization}, as subscription fees for ${planname} plan.</p>
                                  <p>The payment is waiting your aproval.</p>
                                  <hr />
                                  <p>${process.env.CLIENT_URL}</p>
                              `
                      };
              
                      transporter.sendMail(mailOptions).then((ee)=>{
                        res.json("payment saved successfully");
                      }).catch((err)=>{
                        return res.status(400).json({
                          success: false,
                          errors: errorHandler(err)
                        });
                      })
                   
                })
                .catch((err)=>{
                        console.log('Payment Update ERROR', err);
                        return res.status(400).json({
                            error: 'Payment Update failed'
                        });
                
                })
            })
        }

    });
};

exports.updatePaymentStateController = (req, res) => {
    const {amount, planname, organization, paymentId} = req.body;
    console.log("Planname:", planname)
            let nextpaymentDate;

            PlanModel.findOne({where:{name: planname}}).then(async plan=>{
                if(!plan) return res.status(400).json({error: "Plan not found!"});
                let organizationObject = await OrganizationModel.findOne({where:{name: organization}});
                if(!organizationObject) return res.status(400).json({error: "Organization not found!"});
                // let totalAmount = organization 
                let date = Date.now();
                const days = (amount / plan.price) * 30;
                nextpaymentDate = await calculateNextPayment(date, days);
                const admin = await UserModel.findOne({where: {organization: organizationObject.name, role:'admin'}});

             PaymentsModel.findByPk(paymentId).then(paymnt=>{
                    if(!paymnt) return res.status(400).json({
                        error: 'Payment not found.'
                    });
                    let payment ={
                        state: "complete"
                    };
                    paymnt.update(payment).then(()=>{
                        let updatedOrganization ={
                            plan: plan.name,
                            is_paid: true,
                            next_payment_date: nextpaymentDate
                        }
                        organizationObject.update(updatedOrganization).then(updatedOrg => {
                            var mailOptions ={
                                from:  process.env.FROM,
                                to:admin.email,
                                subject: 'Subscription approved.',
                                html: `
                                          <h1>Rtech SMS</h1>
                                          <p>Your subscription for ${planname} plan has been approved. It expires on ${nextpaymentDate}. </p>
                                          <p>Thank you for doing business with us.</p>
                                          <hr />
                                          <p>${process.env.CLIENT_URL}</p>
                                      `
                              };
                      
                              transporter.sendMail(mailOptions).then((ee)=>{
                                res.json("payment approved successfully");
                              }).catch((err)=>{
                                return res.status(400).json({
                                  success: false,
                                  errors: errorHandler(err)
                                });
                              })
                             
                        })
                        .catch((err)=>{
                                console.log('Organization Update ERROR', err);
                                return res.status(400).json({
                                    error: 'Organization Update failed'
                                });
                            
                        })
                    })

                })

            
            })
        
};

exports.unitPaymentController = (req, res) => {
    const  {amount,mpesaCode} = req.body;
    const  uid = req.user.id;
    const paydate = new Date();
    const time = new Date(paydate).getTime();

    console.log('UPDATE User payment', uid);

    UserModel.findByPk(uid).then(async (user) => {
        if (!user) {
            return res.status(400).json({
                error: 'Admin not found'
            });
        }

             else {
               let payment = {
                organization: req.user.organization,
                amount: amount,
                date: paydate,
                time: time,
                state: "pending",
               
            };
            UnitPaymentsModel.create(payment).then(paymnt => {
                console.log("process.env.FROM :"+process.env.FROM)
                var mailOptions ={
                    from: user.email,
                    to: process.env.FROM,
                    subject: 'New units purchased.',
                    html: `
                              <h1>${req.user.firstname} ${req.user.last}</h1>
                              <p>A payment of Ksh ${amount} has been made by the above named on behalf of ${req.user.organization}, as payment for ${amount} units.</p>
                              <p>The payment is waiting your aproval.</p>
                              <hr />
                              <p>${process.env.CLIENT_URL}</p>
                          `
                  };
          
                  transporter.sendMail(mailOptions).then((ee)=>{
                    res.json("payment saved successfully");
                  }).catch((err)=>{
                    return res.status(400).json({
                      error: "Could not save payment."
                    });
                  })
      
                })
                .catch(err=>{
                        console.log('Organization Update ERROR', err);
                        return res.status(400).json({
                            error: 'Payment  confirmation failed'
                        });
                    
                })
        }

    });
}


exports.unitPaymentUpdateController = async (req, res) => {
    const {amount, organization, paymentId} = req.body;
            
                let organizationObj = await OrganizationModel.findOne({name: organization});
                if(!organizationObj) return res.status(400).json({error: "Organization not found!"});
                
                
                UnitPaymentsModel.findByPk(paymentId).then(paymnt=>{
                    if(!paymnt) return  res.status(400).json({
                        error: 'Payment not found.'
                    });
               

                let payment ={
                    state: "complete"
                };

                const units = organizationObj.units + amount;
              
                paymnt.update(payment).then(()=>{
                    let orgData = {
                        units: units
                     };
                     organizationObj.update(orgData).then( updatedOrganization => {
                        var mailOptions ={
                            from:  process.env.FROM,
                            to: user.email,
                            subject: 'Payment approved.',
                            html: `
                                      <h1>Rtech SMS</h1>
                                      <p>Your payment  for ${amount} units has been approved. Enjoy sending sms using our system. </p>
                                      <p>Thank you for doing business with us.</p>
                                      <hr />
                                      <p>${process.env.CLIENT_URL}</p>
                                  `
                          };
                  
                          transporter.sendMail(mailOptions).then((ee)=>{
                            res.json("payment approved successfully");
                          }).catch((err)=>{
                            return res.status(400).json({
                              success: false,
                              errors: errorHandler(err)
                            });
                          })
                    }).catch(err =>{
                            console.log('Payment Update ERROR', err);
                            return res.status(400).json({
                                error: 'Payment confirmation failed'
                            });
                        
                    })
                })
                })


            

             
        

    
}

exports.deleteController = (req, res) => {
    let id  =req.params.id;
   
    PaymentsModel.findByPk(id).then(payment => {
        if (!payment) {
            return res.status(400).json({
                error: 'payment not found'
            });
        }
        
        payment.destroy().then(() => {
            
            res.json("payment deleted");
            
        }).catch(err=>{
                console.log('payment delete ERROR', err);
                return res.status(400).json({
                    error: 'payment delete failed'
                });
            
        });
    });
};