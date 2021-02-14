const db = require("../models");
const PlanModel = db.plan;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");
const mail = require("../services/mail");


exports.readAllController = (req, res) => {

    PlanModel.findAll({where: {name:Sequelize.and( { [Op.ne]: "Custom"}, { [Op.ne]: "Free Trial" })}}).then(plans => {
        if (!plans) {
            return res.json([]);
        }
        res.json(plans);
    });
};
exports.readController = (req, res) => {

    const plan = req.params.plan;
    console.log("Plan:",JSON.stringify(plan))

    PlanModel.findAll({where: {name:Sequelize.and({ [Op.ne]: plan }, { [Op.ne]: "Custom" }, { [Op.ne]: "Free Trial" })}}).then(plans => {
        if (!plans) {
            return res.json([]);
        }
        res.json(plans);
    });
};
exports.sendMail = async (req, res) => {
    const {from,subject,h1, message,hidden} = req.body;
 let result = await mail.sendCustomMail(from,subject,h1, message,hidden);
 console.log("Body: "+JSON.stringify(req.body))
 console.log("Result: "+result)
     res.json("Your message has been submitted successfully")
 

};

exports.readSingleController = (req, res) => {

    const name = req.params.plan;

    PlanModel.findOne({where: {name: name}}).then(plan => {
        if (!plan) {
            return res.json([]);
        }
        res.json(plan);
    });
};
exports.deleteController = (req, res) => {
    let id  =req.params.id;
   
    PlanModel.findByPk(id).then(plan => {
        if (!plan) {
            return res.status(400).json({
                error: 'plan not found'
            });
        }
        
        plan.destroy().then(() => {
            
            res.json("plan deleted");
            
        }).catch(err=>{
                console.log('plan delete ERROR', err);
                return res.status(400).json({
                    error: 'plan delete failed'
                });
            
        });
    });
};