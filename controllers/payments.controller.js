const db = require("../models");
const UserModel = db.auth;
const PaymentsModel = db.payments;
const PlanModel = db.plan;
const OrganizationModel = db.organization;
const UnitPaymentsModel = db.unitpayments;
const SenderIdPaymentModel =db.senderidpayments;
const SenderIdModel = db.sendeidrequests;
const {calculateNextPayment} = require("../helpers/Helper");
const mail = require("../services/mail");
const NotificationModel = db.notification;

exports.readController = (req, res) => {
    const organization = req.user.organization;
    PaymentsModel.findOne({where:{organization: organization},order: [
        ['createdAt', 'DESC']
        ]}).then((payment) => {
        if ( !payment) {
            return res.status(400).json({
                error: 'Payment not found'
            });
        };

        res.json(payment);
    });
};

exports.readAllPendingController = (req, res) => {
    PaymentsModel.findAll({where:{state: "pending"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No pending payments found.'
            });
        };

        res.json(payments);
    });
};

exports.readAllCompleteUnitPaymentsController = (req, res) => {
    UnitPaymentsModel.findAll({where:{state: "complete"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No complete payments found.'
            });
        };

        res.json(payments);
    });
};
exports.readAllPendingUnitPaymentsController = (req, res) => {
    UnitPaymentsModel.findAll({where:{state: "pending"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No pending payments found.'
            });
        };

        res.json(payments);
    });
};
exports.readAllPendingSenderIdPaymentsController = (req, res) => {
    SenderIdPaymentModel.findAll({where:{state: "pending"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No pending payments found.'
            });
        };

        res.json(payments);
    });
};

exports.readAllCompleteSenderIdPaymentsController = (req, res) => {
    SenderIdPaymentModel.findAll({where:{state: "complete"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No complete payments found.'
            });
        };

        res.json(payments);
    });
};
exports.readAllCompleteController = (req, res) => {
    PaymentsModel.findAll({where:{state: "complete"},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
        if ( !payments) {
            return res.status(400).json({
                error: 'No complete payments found.'
            });
        };

        res.json(payments);
    });
};
exports.readAllController = (req, res) => {
    const organization = req.user.organization;
    PaymentsModel.findAll({where:{organization: organization},order: [
        ['createdAt', 'DESC']
        ]}).then((payments) => {
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
                    state: "pending"
                };

                 PaymentsModel.create(payment).then(paymnt => {
               
                     
              mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'Subscription.', `New subscription from ${user.firstname} ${user.lastname}`, `A payment of <strong>Ksh ${amount}</strong> has been made by the above named on behalf of <strong>${req.user.organization}</strong>, as subscription fees for <strong>${planname}</strong> plan. </p>
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
                        let date = null;
                      if(organizationObject.next_payment_date && moment(organizationObject.next_payment_date).format("YYYY-MM-DD hh:mm") > moment(new Date()).format("YYYY-MM-DD hh:mm") ){
                          date = moment(organizationObject.next_payment_date).format("YYYY-MM-DD hh:mm");
                      }
                      else{
                          date = Date.now();
                      }
                        const days = (paymnt.amount / plan.price) * 30;
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
                        organizationObject.update(updatedOrganization).then(async () => {   
                            const notification = {
                                message: `Dear ${admin.firstname}, Your payment of Ksh ${paymnt.amount} for ${plan.name} plan has been approved.`,
                                read: false,
                                seen: false,
                                receipient: admin.id,
                                type:'Payment Approval'
                                };
                                await NotificationModel.create(notification);

                          mail.sendMail(res,process.env.FROM, admin.email,'Subscription approved.', `Hello ${admin.firstname}, Welcome Onboard!.`, `Your subscription for <strong> ${plan.name} </strong>plan has been approved. It expires on ${ moment(nextpaymentDate).format('DD/MM/YYYY')}. </p>
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
                     const notification = {
                        message: `Dear ${user.firstname}. Your payment of Ksh ${paymnt.amount} for ${paymnt.plan} plan has been rejected!`,
                        read: false,
                        seen: false,
                        receipient: user.id,
                        type:'Payment rejected'
                        };
                        await NotificationModel.create(notification);
                          mail.sendMail(res,process.env.FROM, user.email,'Payment Rejected.', `Payment Rejected.`, `Your payment of<strong> Ksh ${paymnt.amount} </strong>for <strong>${paymnt.plan}</strong> plan has been rejected. Please check if the Mpesa Confirmation code you sent is correct.</p>`,"Your payment for units has been rejected.")
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
            
                       
                  mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'New units purchased.', `Payment from ${user.firstname} ${user.lastname}`, `A payment of <strong>Ksh ${amount}</strong> has been made by the above named on behalf of <strong>${req.user.organization}</strong>, as payment for <strong>${amount}</strong> units.</p>
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
                     const notification = {
                        message: `Dear ${user.firstname}. Your payment for ${units} units has been approved.`,
                        read: false,
                        seen: false,
                        receipient: user.id,
                        type:'Units Approved'
                        };
                        await NotificationModel.create(notification);
                          mail.sendMail(res,process.env.FROM, user.email,'Payment approved.', `Payment Approved.`, `Your payment  for <strong>${paymnt.amount}</strong> units has been approved. Enjoy sending sms using our system. <p>Thank you for doing business with us.</p>`,"Your payment for units have been approved.")
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
                     const notification = {
                        message: `Dear ${user.firstname}. Your payment for ${paymnt.amount} units has been cancelled. Please try to purchase again.!`,
                        read: false,
                        seen: false,
                        receipient: user.id,
                        type:'Units Rejected'
                        };
                        await NotificationModel.create(notification);
                  
                          mail.sendMail(res,process.env.FROM, user.email,'Payment Rejected.', `Payment Rejected.`, `Your payment  for <strong>${paymnt.amount}</strong> units has been rejected. Please check if the Mpesa Confirmation code you sent is correct.</p>`,"Your payment for units have been rejected.")
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
               
                     
              mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'Upgrade request.', `New upgrade payment from ${user.firstname} ${user.lastname}`, `A payment of <strong>Ksh ${amount}</strong> has been made by the above named on behalf of <strong>${req.user.organization}</strong>, as subscription upgrade fees to <strong>${planname}</strong> plan. </p>
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

exports.senderIdPaymentController = (req, res) => {
    const { senderId, mpesaCode, network} = req.body;
    const uid= req.user.id;
    const paydate = new Date();
    const time = new Date(paydate).getTime();

    let net;
    let amount;
    switch(network){
        case "safaricom":
            net = "Safaricom Only";
            amount = 10000;
            break;
            case "airtel":
            net= "Airtel Only"
            amount = 10000;
            break;
            case "safaricom_and_airtel":
            net = "Safaricom And Airtel"
            amount = 18000;
            break;
    }

    UserModel.findByPk(uid).then(user => {
        if ( !user) {
            return res.status(400).json({
                error: 'Admin not found'
            });
        }
             else {

                
            SenderIdModel.findOne({where:{name: senderId}}).then(async foundSenderId=>{
                if(foundSenderId) return res.status(400).json({error: "This senderId is taken!"});

                let payment = {
                    organization: req.user.organization,
                    amount: amount,
                    date: paydate,
                    time: time,
                    senderId:senderId,
                    amount:amount,
                    state: "pending"
                };

                 SenderIdPaymentModel.create(payment).then(() => {
               
                     
              mail.sendAdminMail(res,process.env.FROM, process.env.MAILERTESTTO,'SenderId Payment.', `${user.firstname} ${user.lastname}`, `A payment of <strong>Ksh ${amount}</strong> has been made by the above named on behalf of <strong>${req.user.organization}</strong>, as fees for <strong>${senderId} senderId </strong>for ${net}. </p>
              <p>Mpesa code: <strong>${mpesaCode}</strong></p>
              <p>The payment is waiting your approval`,"A new senderId request has been made.")

                        res.json("Request made successfully");
                     
                   
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

exports.updateSenderIdPaymentStateController = (req, res) => {
    const { paymentId,organization} = req.body;

             SenderIdPaymentModel.findByPk(paymentId).then(async paymnt=>{
                    if(!paymnt) return res.status(400).json({
                        error: 'Payment not found.'
                    });


                    let payment ={
                        state: "complete"
                    };
                    const senderIdExists = await SenderIdModel.findOne({where:{name: paymnt.senderId}});
                    if(senderIdExists){
                      return res.status(400).json({
                        error: 'This senderId already exists.'
                                });
                    }
                    const admin = await UserModel.findOne({where: {organization: organization, role:'admin'}});
                    paymnt.update(payment).then(async ()=>{ 
                        let senderId ={
                            name: paymnt.senderId,
                            organization: organization,
                            state: "pending"
                           };
                   
                           SenderIdModel.create(senderId)
                        .then(async data => {
                            const notification = {
                                message: `Dear ${admin.firstname}. Your payment for ${paymnt.senderId} senderId has been approved.`,
                                read: false,
                                seen: false,
                                receipient: admin.id,
                                type:'SenderId Payment Approved'
                                };
                                await NotificationModel.create(notification);

                          mail.sendMail(res,process.env.FROM, admin.email,'SenderId payment approved.', `Hello ${admin.firstname}.`, `Your payment for <strong>${paymnt.senderId}</strong> senderId has been approved. We have initiated a request to safaricom to process your sender Id. It will be ready within the next seven days.</p>
                          <p>Thank you for chosing Rtech SMS.</p>`,"Subscription activated")
                                res.json("payment approved successfully. The sendeId has been created.");
                        })
                        .catch(err => {
                           console.log("senderId save error: "+JSON.stringify(err));
                           return res.status(400).json({
                                                  error: 'Error saving  senderds'
                              });
                        });     
                      
                             
                             
                        })
                        .catch((err)=>{
                                console.log('Organization Update ERROR', err);
                                return res.status(400).json({
                                    error: 'Organization Update failed'
                                });
                            
                        })
                    })
            
            
        
};

exports.senderIdpaymentCancelController =  (req, res) => {
    const {paymentId} = req.body;

                SenderIdPaymentModel.findByPk(paymentId).then(async paymnt=>{
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
                   
                     const admin= await UserModel.findOne({where: {organization : organizationObj.name, role:"admin"}});
                         const notification = {
                                message: `Dear ${admin.firstname}. Your payment for ${paymnt.senderId} senderId has been rejected.`,
                                read: false,
                                seen: false,
                                receipient: admin.id,
                                type:'SenderId Payment Rejected'
                                };
                                await NotificationModel.create(notification);
                          mail.sendMail(res,process.env.FROM, admin.email,'Payment Rejected.', `Payment Rejected.`, `Your payment of <strong>Ksh ${paymnt.amount}</strong> for <strong>${paymnt.senderId}</strong> senderId has been rejected. Please check if the Mpesa Confirmation code you sent is correct.</p>`,"Your payment for senderId has been rejected.")
                            res.json("payment saved successfully");
                 
                })
            });
        }
        
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