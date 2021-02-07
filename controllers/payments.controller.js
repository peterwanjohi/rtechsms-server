const db = require("../models");
const UserModel = db.auth;
const PaymentsModel = db.payments;
const PlanModel = db.plan;
const OrganizationModel = db.organization;
const UnitPaymentsModel = db.unitpayments;

const nodemailer = require("nodemailer");


const {calculateNextPayment} = require("../helpers/Helper");
const mail = require("../services/mail");


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
               
                     
              mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'Subscription.', `New subscription from ${user.firstname} ${user.lastname}`, `A payment of Ksh ${amount} has been made by the above named on behalf of ${req.user.organization}, as subscription fees for ${planname} plan. </p>
              <p>Mpesa code: <strong>${mpesaCode}</strong></p>
              <p>The payment is waiting your approval`,"A new subscription has been made.")

                        res.json("payment saved successfully");
                     
                   
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
    const { paymentId} = req.body;
            let nextpaymentDate;
             PaymentsModel.findByPk(paymentId).then(paymnt=>{
                    if(!paymnt) return res.status(400).json({
                        error: 'Payment not found.'
                    });
                    PlanModel.findOne({where:{name: paymnt.plan}}).then(async plan=>{
                        if(!plan) return res.status(400).json({error: "Plan not found!"});
                        let organizationObject = await OrganizationModel.findOne({where:{name: paymnt.organization}});
                        if(!organizationObject) return res.status(400).json({error: "Organization not found!"});
                        // let totalAmount = organization 
                        let date = Date.now();
                        const days = (payment.amount / plan.price) * 30;
                        nextpaymentDate = await calculateNextPayment(date, days);
                        const admin = await UserModel.findOne({where: {organization: organizationObject.name, role:'admin'}});

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
                          mail.sendMail(res,process.env.FROM, admin.email,'Subscription approved.', `Hello ${admin.firstname}, Welcome Onboard!.`, `Your subscription for ${planname} plan has been approved. It expires on ${nextpaymentDate}. </p>
                          <p>Thank you for chosing Rtech SMS.</p>`,"Subscription activated")
                                res.json("payment approved successfully");
                             
                             
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
exports.paymentCancelController =  (req, res) => {
    const {paymentId} = req.body;

                PaymentsModel.findByPk(paymentId).then(async paymnt=>{
                    if(!paymnt) return  res.status(400).json({
                        error: 'Payment not found.'
                    });
                    if(paymnt.state == "complete") return  res.status(400).json({
                        error: 'Payment is already complete'
                    });
                    if(paymnt.state == "rejected") return  res.status(400).json({
                        error: 'Payment is already rejected'
                    });
                    let organizationObj = await OrganizationModel.findOne({name: paymnt.organization});
                    if(!organizationObj) return res.status(400).json({error: "Organization not found!"});

                let payment ={
                    state: "rejected"
                };
                paymnt.update(payment).then(async ()=>{
                   
                     const user= await UserModel.findOne({where: {organization : organizationObj.name, role:"admin"}});
                  
                          mail.sendMail(res,process.env.FROM, user.email,'Payment Rejected.', `Payment Rejected.`, `Your payment  for ${paymnt.amount} units has been rejected. Please check if the Mpesa Confirmation code you sent is correct.</p>`,"Your payment for units have been rejected.")
                            res.json("payment saved successfully");
                 
                })
            });
        }
exports.unitPaymentController = (req, res) => {
    const  {amount,mpesaCode} = req.body;
    const  uid = req.user.id;
    const paydate = new Date();
    const time = new Date(paydate).getTime();

    console.log('User', JSON.stringify(req.user));

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
            
                       
                  mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'New units purchased.', `Payment from ${user.firstname} ${user.lastname}`, `A payment of Ksh ${amount} has been made by the above named on behalf of ${req.user.organization}, as payment for ${amount} units.</p>
                  <p>Mpesa code: <strong>${mpesaCode}</strong></p>
                  <p>The payment is waiting your aproval.</p>`,"Units have ben purchased.")
                    res.json("payment saved successfully");
                
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


exports.unitPaymentUpdateController =  (req, res) => {
    const {paymentId} = req.body;
    console.log("Payment id: "+paymentId)
                UnitPaymentsModel.findByPk(paymentId).then(async paymnt=>{
                    if(!paymnt) return  res.status(400).json({
                        error: 'Payment not found.'
                    });
                    if(paymnt.state == "complete") return  res.status(400).json({
                        error: 'Payment is already complete'
                    });
                    if(paymnt.state == "rejected") return  res.status(400).json({
                        error: 'Payment is already rejected'
                    });
                    let organizationObj = await OrganizationModel.findOne({name: paymnt.organization});
                    if(!organizationObj) return res.status(400).json({error: "Organization not found!"});

                let payment ={
                    state: "complete"
                };

                const units = organizationObj.units + paymnt.amount;
              
                paymnt.update(payment).then(()=>{
                    let orgData = {
                        units: units
                     };
                     organizationObj.update(orgData).then(async () => {
                     const user= await UserModel.findOne({where: {organization : organizationObj.name, role:"admin"}});
                  
                          mail.sendMail(res,process.env.FROM, user.email,'Payment approved.', `Payment Approved.`, `Your payment  for ${paymnt.amount} units has been approved. Enjoy sending sms using our system. <p>Thank you for doing business with us.</p>`,"Your payment for units have been approved.")
                            res.json("payment saved successfully");
                        
                        
                    }).catch(err =>{
                            console.log('Payment Update ERROR', err);
                            return res.status(400).json({
                                error: 'Payment confirmation failed'
                            });
                        
                    })
                })
                })
    
}
exports.unitPaymentCancelController =  (req, res) => {
    const {paymentId} = req.body;
    console.log("Payment id: "+paymentId)
                UnitPaymentsModel.findByPk(paymentId).then(async paymnt=>{
                    if(!paymnt) return  res.status(400).json({
                        error: 'Payment not found.'
                    });
                    if(paymnt.state == "complete") return  res.status(400).json({
                        error: 'Payment is already complete'
                    });
                    if(paymnt.state == "rejected") return  res.status(400).json({
                        error: 'Payment is already rejected'
                    });
                    let organizationObj = await OrganizationModel.findOne({name: paymnt.organization});
                    if(!organizationObj) return res.status(400).json({error: "Organization not found!"});

                let payment ={
                    state: "rejected"
                };
                paymnt.update(payment).then(async ()=>{
                   
                     const user= await UserModel.findOne({where: {organization : organizationObj.name, role:"admin"}});
                  
                          mail.sendMail(res,process.env.FROM, user.email,'Payment Rejected.', `Payment Rejected.`, `Your payment  for ${paymnt.amount} units has been rejected. Please check if the Mpesa Confirmation code you sent is correct.</p>`,"Your payment for units have been rejected.")
                            res.json("payment saved successfully");
                 
                })
            });
        }
exports.upgradeController = (req, res) => {
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
                
            PlanModel.findOne({where:{name: planname}}).then(async plan=>{
                if(!plan) return res.status(400).json({error: "Plan not found!"});

                let payment = {
                    organization: req.user.organization,
                    amount: amount,
                    date: paydate,
                    time: time,
                    plan:planname,
                    type: "Upgrade",
                    state: "pending"
                };

                 PaymentsModel.create(payment).then(paymnt => {
               
                     
              mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'Upgrade request.', `New upgrade payment from ${user.firstname} ${user.lastname}`, `A payment of Ksh ${amount} has been made by the above named on behalf of ${req.user.organization}, as subscription upgrade fees to ${planname} plan. </p>
              <p>Mpesa code: <strong>${mpesaCode}</strong></p>
              <p>The payment is waiting your approval`,"A new subscription has been made.")

                        res.json("payment saved successfully");
                     
                   
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
exports.deleteController = (req, res) => {
    let id  =req.params.id;
   
    PaymentsModel.findByPk(id).then(async payment => {
        if (!payment) {
            return res.status(400).json({
                error: 'payment not found'
            });
        }
        
        try{
       await payment.destroy();
            
            res.json("payment deleted");
            
        }
        catch(err){
                console.log('payment delete ERROR', err);
                return res.status(400).json({
                    error: 'payment delete failed'
                });
            
        }
    });
};