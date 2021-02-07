const db = require("../models");
const PlanModel = db.plan;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");

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

    PlanModel.findAll({where: {name:Sequelize.and({ [Op.ne]: plan }, { [Op.ne]: "Custom" }, { [Op.ne]: "Free Trial" })}}).then(plans => {
        if (!plans) {
            return res.json([]);
        }
        res.json(plans);
    });
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