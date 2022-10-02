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

app.get('/history', function (request, response) {
    let userid = request.query.userid;
    connection.query("SELECT c.ctUserID, c.mbTypeID, c.ctPoint FROM customerinfo c where c.ctUserID ='" + userid + "'", function (error, results) {
        if (error) throw error;
        if (results.length > 0) {
            let body = {
                ctUserID: results[0].ctUserID,
                mbTypeID: results[0].mbTypeID,
                ctPoint: results[0].ctPoint
            }
            response.send(body);
            response.end();
        } else {
            response.sendStatus(400);
            response.end();
        }
        response.end();
    });
});
app.put('/update-user', function (request, response) {
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let dob = request.body.dob;
    let gender = request.body.gender;
    let userid = request.body.userid;

    // Ensure the input fields exists and are not empty
    if (userid) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('UPDATE customerinfo SET ctFirstName=?,ctLastName=?,ctGender=?,ctDOB=? WHERE ctUserID = ?',
            [firstname, lastname, gender, dob, userid],
            function (error) {
                // If there is an issue with the query, output the error
                if (error) {
                    throw error;
                } else {
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
app.get('/user-info', function (request, response) {
    let userid = request.query.userid;
    connection.query("SELECT c.ctFirstName, c.ctLastName, c.ctTel, c.ctEmail, c.ctGender, c.ctDOB, c.ctPoint, c.ctTotalConsumption FROM customerinfo c WHERE c.ctUserID='" + userid + "'", function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
            let body = {
                firstname: results[0].ctFirstName,
                lastname: results[0].ctLastName,
                phone: results[0].ctTel,
                email: results[0].ctEmail,
                gender: results[0].ctGender,
                dob: results[0].ctDOB,
                ctPoint: results[0].ctPoint,
                ctTotalConsumption: results[0].ctTotalConsumption
            }
            response.send(body);
            response.end();
        } else {
            response.sendStatus(400);
            response.end();
        }
        response.end();
    });
});

app.get('/room-admin', function (request, response) {
    let dataResult = [];
    connection.query("SELECT r.RoomID, N.RoomTypeName, r.rStatus, r.rfloor, r.rCleaningState, r.rNumBed, r.rCapacity, r.rSize, r.rDefaultPrice, r.rImage, r.rDescription, r.rRating  FROM roominfo r left join roomtype N on r.RoomTypeID = N.RoomTypeID", function (error, results){
        if (error) throw error;

        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let body = {
                    RoomID: results[i].RoomID,
                    RoomName: results[i].RoomTypeName,
                    rStatus: results[i].rStatus,
                    rfloor: results[i].rfloor,
                    rCleaning: results[i].rCleaning,
                    rNumbed: results[i].rNumBed,
                    rCapacity: results[i].rCapacity,
                    rSize: results[i].rSize,
                    rDefaultPrice: results[i].rDefaultPrice,
                    rImage: results[i].rImage,
                    rDescription: results[i].rDescription,
                    rRating: results[i].rRating,

                }
                dataResult.push(body);
            }
            response.send(dataResult);
            response.end();
        } else {
            response.send(dataResult);
            response.end();
        }
    })
})

app.get('/staff', function (request, response) {
    let dataResult = [];
    connection.query("SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID", function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let body = {
                    StaffID: results[i].StaffID,
                    sFirstName: results[i].sFirstName,
                    sLastName: results[i].sLastName,
                    sPhoneNum: results[i].sPhoneNum,
                    sMail: results[i].sMail,
                    pName: results[i].pName
                }
                dataResult.push(body);
            }
            response.send(dataResult);
            response.end();
        } else {
            response.send(dataResult);
            response.end();
        }
    });
});

app.get('/staff-info', function (request, response) {
    let staffid = request.query.staffid;
    let dataResult = [];
    connection.query("SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, s.PositionID, s.sSalary, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID WHERE s.StaffID=?", [staffid], function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let body = {
                    staffid: results[i].StaffID,
                    firstname: results[i].sFirstName,
                    lastname: results[i].sLastName,
                    phone: results[i].sPhoneNum,
                    email: results[i].sMail,
                    pName: results[i].pName,
                    position: results[i].PositionID,
                    salary: results[i].sSalary
                }
                dataResult.push(body);
            }
            response.send(dataResult[0]);
            response.end();
        } else {
            response.send({});
            response.end();
        }
    });
});
app.put('/staff/edit', function (request, response) {
    let staffid = request.body.staffid;
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let salary = request.body.salary;
    let email = request.body.email;
    let phone = request.body.phone;
    let position = request.body.position;

    // Ensure the input fields exists and are not empty
    if (staffid) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('UPDATE staffinfo SET sFirstName=?,sLastName=?,PositionID=?,sSalary=?,sPhoneNum=?,sMail=? WHERE StaffID =?',
            [firstname, lastname, position, salary, phone, email, staffid],
            function (error) {
                // If there is an issue with the query, output the error
                if (error) {
                    throw error;
                } else {
                    response.sendStatus(200);
                    response.end();
                }
            });

    } else {
        throw 'error';
    }
});

app.post('/staff/add', function (request, response) {
    let password = request.body.password;
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let salary = request.body.salary;
    let email = request.body.email;
    let phone = request.body.phone;
    let position = request.body.position;

    // Ensure the input fields exists and are not empty
    if (password && email && phone) {
        let max = 1;
        connection.query("SELECT max(CAST(right(StaffID, 4) AS UNSIGNED)) as maxId FROM staffinfo", function (err, resp) {
            if (resp.length > 0) {
                max = resp[0].maxId;
            }
            let user = "ST";
            for (let index = 0; index < 4 - max.toString().length; index++) {
                user += "0";
            }
            user += (max + 1);

            // Execute SQL query that'll select the account from the database based on the specified username and password
            connection.query('INSERT INTO staffinfo(StaffID, sFirstName, sLastName, sPassword, PositionID, sSalary, sPhoneNum, sMail) VALUES (?,?,?,?,?,?,?,?)',
                [user, firstname, lastname, password, position, salary, phone, email],
                function (error) {
                    // If there is an issue with the query, output the error
                    if (error) {
                        throw error;
                    } else {
                        response.sendStatus(200);
                        response.end();
                    }
                });

        });

    } else {
        throw 'error';
    }
});

app.get('/room', function (request, response) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query('select DISTINCT ri.RoomTypeID, r.RoomTypeName, ri.rNumBed, ri.rCapacity, ri.rImage, ri.rDescription, ri.rDefaultPrice from roominfo ri left join roomtype r on ri.RoomTypeID = r.RoomTypeID', function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
            let dataResult = [];
            for (let i = 0; i < results.length; i++) {
                let body = {
                    roomTypeID: results[i].RoomTypeID,
                    roomTypeName: results[i].RoomTypeName,
                    numBed: results[i].rNumBed,
                    capacity: results[i].rCapacity,
                    image: results[i].rImage,
                    description: results[i].rDescription,
                    price: results[i].rDefaultPrice
                }
                dataResult.push(body);
            }
            response.send(dataResult);
            response.end();
        } else {
            throw error;
        }
        response.end();
    });
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3001);

console.log('Running at Port 3001');