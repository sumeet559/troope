var MongoClient       =     require('mongodb').MongoClient;

module.exports = function(server){
    server.post('user-put', function(req,res){
        console.log("In Submission POST")
        var user_data = "";
        MongoClient.connect(config.mongo_url, function(err, db) {
            db.collection("troope_users").updateOne({
                { "user_id" : req.body.user_id },
                { $set: { data.address:req.body.address,
                        data.bank_no :req.body.bank_no,
                        data.current_company : req.body.current_company,
                        data.job_title : req.body.job_title,
                        data.freelancing : req.body.freelancing,
                        data.bank_ifsc:req.body.bank_ifsc,
                        data.looking_projects: req.body.looking_projects,
                        data.mobile:req.body.mobile
                 } }
            })
        });
        res.render('./views/index.ejs',{
            Test: TestType
        });
    });
}