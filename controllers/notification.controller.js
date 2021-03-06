const db = require("../models");
const NotificationModel = db.notification;

exports.readAllController = (req, res) => {

    NotificationModel.findAll({where:{receipient: req.user.id},order: [
        ['createdAt', 'DESC']
        ]}).then(notifications => {
        if (!notifications) {
            return res.json([]);
        }
        res.json(notifications);
    });
};

exports.markAllSeen = (req, res) => {

    NotificationModel.update({ seen: true}, {where:{receipient: req.user.id}}).then(notifications => {
        if (!notifications) {
            return res.json({});
        }
        res.json({});
    });
};


exports.markRead = (req, res) => {
    const notificationId = req.params.id;
    NotificationModel.findByPk(notificationId).then(notification => {
        if (!notification) {

            return res.status(400).json({
                success: false,
                errors:"There is no notification with this ID!!."
              });
        }
        const update = {read: true};
        notification.update(update).then(()=>{
            res.json({});
        })
       
    });
};

