const db = require("../models");
const PlanModel = db.plan;
const Op = db.Sequelize.Op;

exports.readAllController = (req, res) => {

    PlanModel.findAll({where: {name: { [Op.ne]: "Custom" }}}).then(plans => {
        if (!plans) {
            return res.status(400).json({
                error: 'No plans found'
            });
        }
        res.json(plans);
    });
};
exports.readController = (req, res) => {

    const plan = req.params.plan;

    PlanModel.findAll({where: {name: { [Op.ne]: plan }, name: { [Op.ne]: "Custom" }}}).then(plans => {
        if (!plans) {
            return res.status(400).json({
                error: 'No plans found'
            });
        }
        res.json(plans);
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