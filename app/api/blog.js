mongoose = require('mongoose');

var api = {};
var model = mongoose.model('Blog');
var point = {}

api.lista = function(req, res) {
    model.find({}).populate('especialidade')
        .then(function(blogs) {
            res.json(blogs);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}


api.byTitle = function(req, res) {
    model.find({ link_blog: req.params.linkblog})
        .then(function(blog) {
            res.json(blog);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}
api.byEspecialidade = function(req, res) {
    model.find({ 'speciality': req.params.speciality })
        .then(function(blog) {
            res.json(blog);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.buscaPorId = function(req, res) {
    model.findById(req.params.id)
        .then(function(blog) {
            if (!blog) throw Error('blog não localizado');
            res.json(blog);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}



api.adiciona = async function(req, res) {

    if (!req.body) {
        req.body = req;
    }

    const { title, link_blog, link_author, especialidade, doctor_name, doctor_pic, short_description, description, img, reviews, createdAt } = req.body;

    let blogForm = {
        title: title,
        link_blog: formatarTitleUrl(link_blog),
        link_author: formatarTitleUrl(link_author),
        especialidade: especialidade,
        doctor_name: doctor_name,
        doctor_pic: doctor_pic,
        short_description: short_description,
        description: description,
        img: img,
        reviews: reviews,
        createdAt: createdAt
        
    }

    //blogForm.link_blog = link_blog.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    

    model.create(blogForm)
        .then(async function(blog) {

            await blog.save();
            if (req.body.id) {
                return true;
            } else {
                res.json(blog);
            }

        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.atualiza = async function(req, res) {
    const _id = req.params.id;
    const { title, link_blog, link_author, especialidades, doctor_name, doctor_pic, short_description, description, img, reviews, createdAt } = req.body;

    let blogForm = {
        title: title,
        link_blog: link_blog,
        link_author: link_author,
        especialidades: especialidades,
        doctor_name: doctor_name,
        doctor_pic: doctor_pic,
        short_description: short_description,
        description: description,
        img: img,
        reviews: reviews,
        createdAt: createdAt

    }

  /*  blogForm.link_blog = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    blogForm.link_author = doctor_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");*/

    await model.findOneAndUpdate({ _id }, blogForm, { new: true }).then(async function(blo) {
        res.json(blo);
    }, function(error) {
        console.log(error);
        res.status(500).json(error);
    });
}



api.getReview = async function(req, res) {
    try {
        let review = await model.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'user',
                model: 'Usuario',
                select: 'nome'
            }
        }).select('reviews');
        res.status(200).json({ reviews: review });

    } catch (err) {
        console.log('Erro não esperado ao salvar usuário ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
};

api.createReview = async function(req, res) {

    try {

        let a = await model.findOneAndUpdate({ _id: req.params.id }, { $push: { reviews: req.body } });
        res.status(200).json(true);

    } catch (err) {
        console.log('Erro não esperado ao salvar review ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
};

/*api.removePorId = function(req, res){
    model.deleteOne({_id: req.params.id})
        .then(function(){
            res.sendStatus(204);

        }, function(error){
            console.log(error);
            res.status(500).json(error);
        })
} */

function formatarTitleUrl(str) {
    if (str) {
        return str.trim().split(' ').join('-').toLowerCase();
    } else {
        return "";
    }

}
function formatarParamUrl(str) {
    if (str) {
        return str.trim().split('-').join(' ');
    } else {
        return "";
    }

}


module.exports = api;