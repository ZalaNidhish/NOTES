const path = require("path");
const express = require("express");
const app = express();
const fs = require("fs");
// const { Console } = require("console");
const usermodel = require('./usermodel');
const bcrypt = require('bcrypt')


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.get('/', function (req, res) {
    res.render("index");
})

app.get('/register', function (req, res) {
    res.render("register");
})

app.post('/register', async function (req, res) {

    const _name = req.body.username.split(' ').join('_');
    let _pass = req.body.password;
    const _email = req.body.email;
    const _contact = req.body.contact;
    const _path = `notes/${_name}`

    const hash = await bcrypt.hash(_pass, 10);

    _pass = hash;

    const exuser = await usermodel.findOne({ username: _name })

    if (exuser) {

        console.log("user already exists");
        res.redirect('/')

    } else {
        const user = await usermodel.create({
            username: _name,
            pass: _pass,
        })

        console.log(user)

        fs.mkdir(_path, function (err) {
            if (err) {
                console.log("error found", err);
            } else {
                console.log("user directory created")
            }
        })

        res.redirect(`/userpage/${_name}`)
    }
})


app.get('/login', function (req, res) {
    res.render("login");
})

app.post('/login', async function (req, res) {

    const _name = req.body.Username.split(' ').join('_');
    const _password = req.body.password;
    const user = await usermodel.findOne({ username: _name })
    const check = await bcrypt.compare(_password, user.pass)


    if (user && check) {
            console.log('login successful');    
            res.redirect(`userpage/${_name}`);
    }else{
        console.log('incorrect details');
        res.redirect('/')
        
    }
})


app.post('/newnote/:dir_name', function (req, res) {
    dir_name = req.params.dir_name;
    const filepath = `./notes/${dir_name}/${req.body.title.split(' ').join('')}.txt`
    fs.writeFile(filepath, req.body.details, function (err) {
        if (err) {
            console.log("error found", err);
        }
    });
    res.redirect(`/userpage/${dir_name}`)
})

app.get('/newnote/:dir_name', function (req, res) {
    res.render("new", { dir_name: req.params.dir_name });
})


app.get('/notes/:dir_name/:file', function (req, res) {
    fs.readFile(`./notes/${req.params.dir_name}/${req.params.file}`, "utf-8", function (err, filedata) {
        if (err) {
            console.log("error in file data ", err);
        }
        res.render("data", { dir_name: req.params.dir_name, file: req.params.file, data: filedata })
    })



})

app.get('/delete/:dir_name/:file', function (req, res) {
    res.render("delete", { dir_name: req.params.dir_name, file: req.params.file });
})

app.get('/deleting/:dir_name/:file', function (req, res) {

    fs.rm(`./notes/${req.params.dir_name}/${req.params.file}`, function (err) {
        if (err) {
            console.log("error in deleting file", err)
        }
        else {
            console.log("file deleted");

        }
    })
    res.redirect(`/userpage/${req.params.dir_name}`);

})

app.post('/edit/:dir_name/:file/:data', function (req, res) {
    const newtitle = req.body.title;
    const newdetails = req.body.details;
    const oldtitle = req.params.file;
    const olddetails = req.params.data;
    var details = olddetails;
    details = details.replace(olddetails, newdetails);

    fs.rename(`./notes/${req.params.dir_name}/${oldtitle}`, `./notes/${req.params.dir_name}/${newtitle}`, function (err) {
        if (err) {
            console.log("Error in renaming file", err)
        }
    })

    fs.writeFile(`./notes/${req.params.dir_name}/${newtitle}`, details, function (err) {
        if (err) {
            console.log("Error found in updating data");
        }
    })

    res.redirect(`/userpage/${req.params.dir_name}`)

})


app.get('/userpage/:dir_name', function (req, res) {

    const dir_name = req.params.dir_name;
    fs.readdir(`./Notes/${dir_name}`, function (err, files) {
        if (err) {
            console.log("there is an error finding your files ...", err)
        } else {
            console.log("files are ", files)
        }
        res.render("main", { files: files, dir_name: dir_name });
    })
})


app.listen("3000", function () {
    console.log("server is on");

});