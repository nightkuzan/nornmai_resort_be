const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const moment = require('moment');

const mysql = require('mysql');

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());

// Connect database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nornmai_resort'
});


app.post('/signup', function (request, response) {
    let password = request.body.password;
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let dob = request.body.dob;
    let email = request.body.email;
    let phone = request.body.phone;
    let gender = request.body.gender;

    // Ensure the input fields exists and are not empty
    if (password && email && phone) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('INSERT INTO customerinfo(ctFirstName, ctLastName, ctPassword, ctTel, ctEmail, ctGender, ctDOB, mbTypeID, ctPoint, ctTotalConsumption) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [firstname, lastname, password, phone, email, gender, dob, 'GU231', 0, 0],
            function (error) {
                // If there is an issue with the query, output the error
                if (error) {
                    throw error;
                } else {
                    let userid;
                    connection.query("SELECT ctUserID FROM customerinfo where ctEmail=?", [email], function (err, resp) {
                        if (resp.length > 0) {
                            userid = resp[0].ctUserID;
                        }
                    });
                    let body = {
                        "userid": userid
                    }
                    response.send(body);
                    response.end();
                }
            });
    } else {
        throw 'error';
    }
});

app.post('/login', function (request, response) {
    // Capture the input fields
    let email = request.body.email;
    let password = request.body.password;

    // Ensure the input fields exists and are not empty
    if (email && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('select c.ctUserId, c.ctFirstName, c.ctLastName, c.mbTypeID, m.mbTypeName from customerinfo c left join membertype m on c.mbTypeID = m.mbTypeID WHERE c.ctEmail = ? AND c.ctPassword = ?', [email, password], function (error, results) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                let body = {
                    ctUserId: results[0].ctUserId,
                    ctFirstName: results[0].ctFirstName,
                    ctLastName: results[0].ctLastName,
                    mbTypeID: results[0].mbTypeID,
                    mbTypeName: results[0].mbTypeName
                }
                response.send(body);
                response.end();
            } else {
                response.sendStatus(404);
                response.end();
            }
            response.end();
        });
    } else {
        throw error;
    }
});

app.post('/login-admin', function (request, response) {
    // Capture the input fields
    let staffid = request.body.staffid;
    let password = request.body.password;

    // Ensure the input fields exists and are not empty
    if (staffid && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, s.PositionID, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID WHERE s.StaffID=? AND s.sPassword=? ', [staffid, password], function (error, results) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                let body = {
                    StaffID: results[0].StaffID,
                    sFirstName: results[0].sFirstName,
                    sLastName: results[0].sLastName,
                    sPhoneNum: results[0].sPhoneNum,
                    sMail: results[0].sMail,
                    PositionID: results[0].PositionID,
                    pName: results[0].pName
                }
                response.send(body);
                response.end();
            } else {
                response.sendStatus(404);
                response.end();
            }
            response.end();
        });
    } else {
        throw error;
    }
});

app.get('/history', (req, res) => {
    connection.query("SELECT ctUserID, mbTypeID, ctPoint FROM customerinfo", (err, result) => {
        if (err){
            console.log(err);
        }
        else{
            res.send(result);
            res.end();
        }
    });
});
//add the router
app.use('/', router);
app.listen(process.env.port || 3001);

console.log('Running at Port 3001');