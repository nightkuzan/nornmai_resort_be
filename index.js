const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");

const mysql = require("mysql");

const cors = require("cors");
const { request, response } = require("express");
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());

// Connect database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nornmai_resort",
});

app.post("/signup", function (request, response) {
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
    connection.query(
      "INSERT INTO customerinfo(ctFirstName, ctLastName, ctPassword, ctTel, ctEmail, ctGender, ctDOB, mbTypeID, ctPoint, ctTotalConsumption) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [firstname, lastname, password, phone, email, gender, dob, "GU231", 0, 0],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          let userid;
          connection.query(
            "SELECT ctUserID FROM customerinfo where ctEmail=?",
            [email],
            function (err, resp) {
              if (resp.length > 0) {
                userid = resp[0].ctUserID;
              }
            }
          );
          let body = {
            userid: userid,
          };
          response.send(body);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.post("/login", function (request, response) {
  // Capture the input fields
  let email = request.body.email;
  let password = request.body.password;

  // Ensure the input fields exists and are not empty
  if (email && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "select c.ctUserId, c.ctFirstName, c.ctLastName, c.mbTypeID, m.mbTypeName from customerinfo c left join membertype m on c.mbTypeID = m.mbTypeID WHERE c.ctEmail = ? AND c.ctPassword = ?",
      [email, password],
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          let body = {
            ctUserId: results[0].ctUserId,
            ctFirstName: results[0].ctFirstName,
            ctLastName: results[0].ctLastName,
            mbTypeID: results[0].mbTypeID,
            mbTypeName: results[0].mbTypeName,
          };
          response.send(body);
          response.end();
        } else {
          response.sendStatus(404);
          response.end();
        }
        response.end();
      }
    );
  } else {
    throw error;
  }
});

app.post("/login-admin", function (request, response) {
  // Capture the input fields
  let staffid = request.body.staffid;
  let password = request.body.password;

  // Ensure the input fields exists and are not empty
  if (staffid && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, s.PositionID, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID WHERE s.StaffID=? AND s.sPassword=? ",
      [staffid, password],
      function (error, results) {
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
            pName: results[0].pName,
          };
          response.send(body);
          response.end();
        } else {
          response.sendStatus(404);
          response.end();
        }
        response.end();
      }
    );
  } else {
    throw error;
  }
});

app.get("/history", function (request, response) {
  let userid = request.query.userid;
  connection.query(
    "SELECT c.ctUserID, c.mbTypeID, c.ctPoint FROM customerinfo c where c.ctUserID ='" +
      userid +
      "'",
    function (error, results) {
      if (error) throw error;
      if (results.length > 0) {
        let body = {
          ctUserID: results[0].ctUserID,
          mbTypeID: results[0].mbTypeID,
          ctPoint: results[0].ctPoint,
        };
        response.send(body);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});
app.put("/update-user", function (request, response) {
  let firstname = request.body.firstname;
  let lastname = request.body.lastname;
  let dob = request.body.dob;
  let gender = request.body.gender;
  let userid = request.body.userid;

  // Ensure the input fields exists and are not empty
  if (userid) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "UPDATE customerinfo SET ctFirstName=?,ctLastName=?,ctGender=?,ctDOB=? WHERE ctUserID = ?",
      [firstname, lastname, gender, dob, userid],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          let body = {
            userid: userid,
          };
          response.send(body);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});
app.get("/user-info", function (request, response) {
  let userid = request.query.userid;
  connection.query(
    "SELECT c.ctFirstName, c.ctLastName, c.ctTel, c.ctEmail, c.ctGender, c.ctDOB, c.ctPoint, c.ctTotalConsumption FROM customerinfo c WHERE c.ctUserID='" +
      userid +
      "'",
    function (error, results) {
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
          ctTotalConsumption: results[0].ctTotalConsumption,
        };
        response.send(body);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});

app.get("/room-admin", function (request, response) {
  let dataResult = [];
  connection.query(
    "SELECT r.RoomID, N.RoomTypeName, r.rStatus, r.rfloor, r.rCleaningState, r.rNumBed, r.rCapacity, r.rSize, r.rDefaultPrice, r.rImage, r.rDescription, r.rRating  FROM roominfo r left join roomtype N on r.RoomTypeID = N.RoomTypeID",
    function (error, results) {
      if (error) throw error;

      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            RoomID: results[i].RoomID,
            RoomName: results[i].RoomTypeName,
            rStatus: results[i].rStatus,
            rfloor: results[i].rfloor,
            rCleaning: results[i].rCleaningState,
            rNumbed: results[i].rNumBed,
            rCapacity: results[i].rCapacity,
            rSize: results[i].rSize,
            rDefaultPrice: results[i].rDefaultPrice,
            rImage: results[i].rImage,
            rDescription: results[i].rDescription,
            rRating: results[i].rRating,
          };
          dataResult.push(body);
        }
        response.send(dataResult);
        response.end();
      } else {
        response.send(dataResult);
        response.end();
      }
    }
  );
});

app.put("/room/clean", function (request, response) {
  let roomID = request.body.RoomID;
  if (roomID) {
    connection.query(
      "UPDATE roominfo SET rCleaningState='Y' WHERE RoomID=?",
      [roomID],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          response.sendStatus(200);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.get("/payment", function (request, response) {
  let dataResult = [];
  connection.query(
    "SELECT c.ctUserID, c.ctFirstName, c.ctLastName, b.BookingID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, h.cIntime, h.cOuttime ,b.bkStatus from bookinginfo as b left join checkinfo as h on h.BookingID = b.BookingID, roomtype r, customerinfo as c WHERE r.RoomTypeID = b.RoomTypeID and c.ctUserID = b.ctUserID and b.bkStatus != 'Cancel'",
    function (error, results) {
      if (error) throw error;

      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            cid: results[i].ctUserID,
            fname: results[i].ctFirstName,
            lname: results[i].ctLastName,
            bookid: results[i].BookingID,
            rtname: results[i].RoomTypeName,
            bcheckin: results[i].bkCheckInDate,
            bcheckout: results[i].bkLeaveDate,
            discount: results[i].dcCode,
            pdiscount: results[i].bkpointDiscount,
            totalprice: results[i].bkTotalPrice,
            getpoint: results[i].bkGetPoint,
            checkin: results[i].cIntime,
            checkout: results[i].cOuttime,
            bkstatus: results[i].bkStatus,
          };
          dataResult.push(body);
        }
        response.send(dataResult);
        response.end();
      } else {
        response.send(dataResult);
        response.end();
      }
    }
  );
});

app.get("/payment-update", function (request, response) {
  let booking = request.query.bookingid;
  let dataResult = [];
  if (booking) {
    connection.query(
      "SELECT DISTINCT b.BookingID, b.bkCheckInDate, b.bkLeaveDate, b.bkTotalPrice, b.bkStatus, r.rImage FROM bookinginfo b, roomtype t left join roominfo r  on t.RoomTypeID = r.RoomTypeID WHERE t.RoomTypeID = b.RoomTypeID and b.BookingID='" +
        booking +
        "'",
      function (error, results) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
            let body = {
              bookingid: results[i].BookingID,
              bcheckin: results[i].bkCheckInDate,
              bcheckout: results[i].bkLeaveDate,
              price: results[i].bkTotalPrice,
              status: results[i].bkStatus,
              image: results[i].rImage,
            };
            dataResult.push(body);
            response.send(dataResult[0]);
            response.end();
          }
        } else {
          response.send(dataResult);
          response.end();
        }
      }
    );
  }
});

app.post("/payment/update", function (request, response) {
  let status = request.body.bkStatus;
  let bookingid = request.body.bookingid;
  let price = request.body.price;
  let pDate = request.body.date;
  let staff = request.body.staffid;
  //"INSERT INTO paymentinfo(BookingID, pAmount, pDate, StaffID) VALUES (?,?,?,?)"
  if (bookingid) {
    connection.query(
      "INSERT INTO paymentinfo(BookingID, pAmount, pDate, StaffID) VALUES (?,?,?,?)",
      [bookingid, price, pDate, staff],
      function (error, res) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        connection.query(
          "UPDATE bookinginfo b SET b.bkStatus = ? WHERE b.BookingID = ?",
          [status, bookingid]
        );
        response.sendStatus(200);
        response.end();
      }
    );
  } else {
    throw "error";
  }
});

app.get("/staff", function (request, response) {
  let dataResult = [];
  connection.query(
    "SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID",
    function (error, results) {
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
            pName: results[i].pName,
          };
          dataResult.push(body);
        }
        response.send(dataResult);
        response.end();
      } else {
        response.send(dataResult);
        response.end();
      }
    }
  );
});

app.get("/staff-info", function (request, response) {
  let staffid = request.query.staffid;
  let dataResult = [];
  connection.query(
    "SELECT s.StaffID, s.sFirstName, s.sLastName, s.sPhoneNum, s.sMail, s.PositionID, s.sSalary, p.pName FROM staffinfo s left join position p on p.PositionID = s.PositionID WHERE s.StaffID=?",
    [staffid],
    function (error, results) {
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
            salary: results[i].sSalary,
          };
          dataResult.push(body);
        }
        response.send(dataResult[0]);
        response.end();
      } else {
        response.send({});
        response.end();
      }
    }
  );
});
app.put("/staff/edit", function (request, response) {
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
    connection.query(
      "UPDATE staffinfo SET sFirstName=?,sLastName=?,PositionID=?,sSalary=?,sPhoneNum=?,sMail=? WHERE StaffID =?",
      [firstname, lastname, position, salary, phone, email, staffid],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          response.sendStatus(200);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.post("/staff/add", function (request, response) {
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
    connection.query(
      "SELECT max(CAST(right(StaffID, 4) AS UNSIGNED)) as maxId FROM staffinfo",
      function (err, resp) {
        if (resp.length > 0) {
          max = resp[0].maxId;
        }
        let user = "ST";
        for (let index = 0; index < 4 - max.toString().length; index++) {
          user += "0";
        }
        user += max + 1;

        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query(
          "INSERT INTO staffinfo(StaffID, sFirstName, sLastName, sPassword, PositionID, sSalary, sPhoneNum, sMail) VALUES (?,?,?,?,?,?,?,?)",
          [user, firstname, lastname, password, position, salary, phone, email],
          function (error) {
            // If there is an issue with the query, output the error
            if (error) {
              throw error;
            } else {
              response.sendStatus(200);
              response.end();
            }
          }
        );
      }
    );
  } else {
    throw "error";
  }
});

app.get("/room", function (request, response) {
  // Execute SQL query that'll select the account from the database based on the specified username and password
  connection.query(
    "select DISTINCT ri.RoomTypeID, r.RoomTypeName, ri.rNumBed, ri.rCapacity, ri.rImage, ri.rDescription, ri.rDefaultPrice from roominfo ri left join roomtype r on ri.RoomTypeID = r.RoomTypeID",
    function (error, results) {
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
            price: results[i].rDefaultPrice,
          };
          dataResult.push(body);
        }
        response.send(dataResult);
        response.end();
      } else {
        throw error;
      }
      response.end();
    }
  );
});

app.get("/reserve-room", function (request, response) {
  let checkin = request.query.checkin;
  let checkout = request.query.checkout;
  let type = request.query.type;

  var from = new Date(checkin);
  var to = new Date(checkout);

  // loop for every day
  let query =
    "select min(a.room_free) as roomFree, a.RoomTypeID, a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.rDescription from (";
  for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
    let date = moment(day).format("YYYY-MM-DD");
    query +=
      "select r.RoomTotal - count(b.BookingID) as room_free, r.RoomTypeID, r.RoomTypeName, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription from roomtype r " +
      "left join (select DISTINCT RoomTypeID, rDefaultPrice, rImage, rRating, rCapacity, rDescription from roominfo) ri on ri.RoomTypeID = r.RoomTypeID " +
      "left join bookinginfo b  on b.RoomTypeID = r.RoomTypeID and '" +
      date +
      "' BETWEEN b.bkCheckInDate and b.bkLeaveDate and b.bkLeaveDate != '" +
      date +
      "' and b.bkStatus != 'CANCEL' " +
      "where b.bkReason is null " +
      "group by r.RoomTypeID, r.RoomTypeName, r.RoomTotal, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription ";
    if (day < to) {
      query += "UNION ";
    }
  }
  query +=
    ") a GROUP by a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.RoomTypeID, a.rDescription HAVING a.RoomTypeID='" +
    type +
    "'";

  // Execute SQL query that'll select the account from the database based on the specified username and password
  connection.query(query, function (error, results) {
    // If there is an issue with the query, output the error
    if (error) throw error;
    // If the account exists
    if (results.length > 0) {
      let dataResult = [];
      for (let i = 0; i < results.length; i++) {
        let body = {
          roomTypeID: results[i].RoomTypeID,
          roomTypeName: results[i].RoomTypeName.toUpperCase(),
          capacity: results[i].rCapacity,
          freeRoom: results[i].roomFree,
          image: results[i].rImage,
          description: results[i].rDescription,
          price: results[i].rDefaultPrice,
        };
        dataResult.push(body);
      }
      response.send(dataResult[0]);
      response.end();
    } else {
      response.sendStatus(400);
      response.end();
    }
    response.end();
  });
});

app.get("/user-point", function (request, response) {
  let userid = request.query.userid;
  connection.query(
    "SELECT c.ctPoint FROM customerinfo c WHERE c.ctUserID='" + userid + "'",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        let body = {
          ctPoint: results[0].ctPoint,
        };
        response.send(body);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});

app.get("/discount", function (request, response) {
  let dcCode = request.query.dcCode;
  connection.query(
    "SELECT s.dcRate FROM seasondiscount s WHERE s.dcStartDate <= CURRENT_DATE and s.dcEndDate >= CURRENT_DATE and s.dcCode ='" +
      dcCode +
      "'",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        let body = {
          dcRate: results[0].dcRate,
        };
        response.send(body);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});

app.post("/reserve", function (request, response) {
  let checkin = request.body.checkin;
  let checkout = request.body.checkout;
  let userid = request.body.userid;
  let numPeople = request.body.numPeople;
  let pointDiscount = request.body.pointDiscount;
  let totalPrice = request.body.totalPrice;
  let dcCode = request.body.dcCode;
  let depositPrice = (totalPrice * 40) / 100;
  let point = totalPrice / 10;
  let roomType = request.body.roomType;

  // Ensure the input fields exists and are not empty
  if (userid && roomType) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "INSERT INTO `bookinginfo`(`ctUserID`, `bkCheckInDate`, `bkLeaveDate`, `bkNumPeople`, `bkpointDiscount`, `bkTotalPrice`, `dcCode`, `bkDeposit`, `bkStatus`, `bkGetPoint`, `RoomTypeID`) VALUES (?,?,?,?,?,?,?,?,'NOT PAID',?,?)",
      [
        userid,
        checkin,
        checkout,
        numPeople,
        pointDiscount,
        totalPrice,
        dcCode,
        depositPrice,
        point,
        roomType,
      ],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          connection.query(
            "UPDATE `customerinfo` SET `ctPoint`=`ctPoint`-? WHERE ctUserID=?",
            [pointDiscount, userid],
            function (error) {
              // If there is an issue with the query, output the error
              if (error) {
                throw error;
              } else {
                response.sendStatus(200);
                response.end();
              }
            }
          );
        }
      }
    );
  } else {
    response.sendStatus(400);
    response.end();
  }
});

app.get("/reserve", function (request, response) {
  let checkin = request.query.checkin;
  let checkout = request.query.checkout;

  var from = new Date(checkin);
  var to = new Date(checkout);

  // loop for every day
  let query =
    "select min(a.room_free) as roomFree, a.RoomTypeID, a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.rDescription from (";
  for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
    let date = moment(day).format("YYYY-MM-DD");
    query +=
      "select r.RoomTotal - count(b.BookingID) as room_free, r.RoomTypeID, r.RoomTypeName, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription from roomtype r " +
      "left join (select DISTINCT RoomTypeID, rDefaultPrice, rImage, rRating, rCapacity, rDescription from roominfo) ri on ri.RoomTypeID = r.RoomTypeID " +
      "left join bookinginfo b  on b.RoomTypeID = r.RoomTypeID and '" +
      date +
      "' BETWEEN b.bkCheckInDate and b.bkLeaveDate and b.bkLeaveDate != '" +
      date +
      "' and b.bkStatus != 'CANCEL' " +
      "where b.bkReason is null " +
      "group by r.RoomTypeID, r.RoomTypeName, r.RoomTotal, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription ";
    if (day < to) {
      query += "UNION ";
    }
  }
  query +=
    ") a GROUP by a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.RoomTypeID, a.rDescription order by a.rDefaultPrice";

  // Execute SQL query that'll select the account from the database based on the specified username and password
  connection.query(query, function (error, results) {
    // If there is an issue with the query, output the error
    if (error) throw error;
    // If the account exists
    if (results.length > 0) {
      let dataResult = [];
      for (let i = 0; i < results.length; i++) {
        let body = {
          roomTypeID: results[i].RoomTypeID,
          roomTypeName: results[i].RoomTypeName,
          capacity: results[i].rCapacity,
          freeRoom: results[i].roomFree,
          image: results[i].rImage,
          description: results[i].rDescription,
          price: results[i].rDefaultPrice,
        };
        dataResult.push(body);
      }
      response.send(dataResult);
      response.end();
    } else {
      response.sendStatus(400);
      response.end();
    }
    response.end();
  });
});

app.get("/history2", function (request, response) {
  let userid = request.query.userid;
  connection.query(
    "SELECT DISTINCT ROW_NUMBER() OVER () as rowId, b.BookingID, r.RoomTypeName, b.bkCheckInDate, rn.rfloor, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, b.bkReason, b.bkStatus, case when c.cIntime is not null and c.cOuttime is not null and rw.ReviewID is null then 'Y' else 'N' end reviewOpen FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join reviewinfo rw on rw.BookingID = b.BookingID left join roominfo rn on rn.RoomTypeID=r.RoomTypeID WHERE b.ctUserID='" +
      userid +
      "' group by b.BookingID desc",
    function (error, results) {
      if (error) throw error;
      if (results.length > 0) {
        databooking = [];
        for (let i = 0; i < results.length; i++) {
          let body = {
            bookingID: results[i].BookingID,
            RoomTypeName: results[i].RoomTypeName,
            bkCheckInDate: results[i].bkCheckInDate,
            rfloor: results[i].rfloor,
            bkLeaveDate: results[i].bkLeaveDate,
            dcCode: results[i].dcCode,
            bkpointDiscount: results[i].bkpointDiscount,
            bkTotalPrice: results[i].bkTotalPrice,
            bkGetPoint: results[i].bkGetPoint,
            bkReason: results[i].bkReason,
            bkStatus: results[i].bkStatus,
            reviewOpen: results[i].reviewOpen,
          };
          databooking.push(body);
        }
        response.send(databooking);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});

app.get("/review-cancel-info", function (request, response) {
  let bookingid = request.query.bookingid;
  ResultData = [];
  connection.query(
    "SELECT DISTINCT b.bkCheckInDate, b.bkLeaveDate, rt.RoomTypeName, b.bkTotalPrice, b.dcCode, b.bkpointDiscount FROM bookinginfo b left join roomtype rt on b.RoomTypeID = rt.RoomTypeID WHERE b.BookingID=?",
    [bookingid],
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            checkin: results[i].bkCheckInDate,
            checkout: results[i].bkLeaveDate,
            roomType: results[i].RoomTypeName,
            roomPrice: results[i].bkTotalPrice,
            dcCode: results[i].dcCode,
            usePoint: results[i].bkpointDiscount,
          };
          ResultData.push(body);
        }
        response.send(ResultData[0]);
        response.end();
      } else {
        response.send({});
        response.end();
      }
    }
  );
});

app.get("/discount-info", function (request, response) {
  let dataResult = [];
  connection.query(
    "SELECT s.dcCode, s.dcRate, s.dcStartDate, s.dcEndDate FROM seasondiscount s where s.dcCode !='NONE' order by s.dcEndDate desc",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            dcCode: results[i].dcCode,
            dcRate: results[i].dcRate,
            startDate: results[i].startDate,
            endDate: results[i].endDate,
          };
          dataResult.push(body);
        }
        response.send(dataResult);
        response.end();
      } else {
        response.send(dataResult);
        response.end();
      }
    }
  );
});

app.post("/discount/add", function (request, response) {
  let dcCode = request.body.dcCode;
  let dcRate = request.body.dcRate;
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;

  // Ensure the input fields exists and are not empty
  if (dcCode && dcRate && startDate && endDate) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "INSERT INTO seasondiscount(dcCode, dcRate, dcStartDate, dcEndDate) VALUES (?,?,?,?)",
      [dcCode, dcRate, startDate, endDate],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          response.sendStatus(200);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.put("/update-reason-cancel", function (request, response) {
  let reason = request.body.reason;
  let bookingid = request.body.bookingid;
  let userid = request.body.userid;

  // Ensure the input fields exists and are not empty
  if (userid) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "UPDATE bookinginfo SET bkReason=? WHERE BookingID = ?",
      [reason, bookingid],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          let body = {
            bookingid: bookingid,
          };
          response.send(body);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.get("/reason", function (request, response) {
  let userid = request.query.userid;
  connection.query(
    "SELECT b.bkReason FROM bookinginfo b where b.ctUserID ='" + userid + "'",
    function (error, results) {
      if (error) throw error;
      if (results.length > 0) {
        let body = {
          bkReason: results[0].bkReason,
        };
        response.send(body);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});
app.get("/check", function (request, response) {
  let search = request.query.search;
  let condition =
    "WHERE b.bkStatus NOT IN ('CANCEL', 'NOT PAID', 'DEPOSIT PAID') ";
  if (search != null && search != "") {
    condition +=
      " AND ct.ctFirstName like '%" +
      search +
      "%' OR ct.ctLastName like '%" +
      search +
      "%' OR b.bkStatus like '%" +
      search +
      "%' OR b.BookingID='" +
      search +
      "' OR b.bkTotalPrice='" +
      search +
      "' OR b.bkCheckInDate='" +
      search +
      "'";
  }
  connection.query(
    "SELECT ROW_NUMBER() OVER () as rowId, ct.ctUserID, concat(ct.ctFirstName,' ',ct.ctLastName) as ctFullname, b.BookingID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, b.bkReason, b.bkStatus, c.cIntime, c.cOuttime, c.RoomID FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join customerinfo ct on ct.ctUserID = b.ctUserID " +
      condition +
      " order by b.BookingID desc",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      let dataResult = [];
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            rowId: results[i].rowId,
            ctUserID: results[i].ctUserID,
            ctFullname: results[i].ctFullname,
            BookingID: results[i].BookingID,
            RoomTypeName: results[i].RoomTypeName,
            checkin: results[i].bkCheckInDate,
            checkout: results[i].bkLeaveDate,
            dcCode: results[i].dcCode,
            point: results[i].bkpointDiscount,
            price: results[i].bkTotalPrice,
            getPoint: results[i].bkGetPoint,
            reason: results[i].bkReason,
            status: results[i].bkStatus,
            cIntime: results[i].cIntime,
            cOuttime: results[i].cOuttime,
            roomId: results[i].RoomID,
          };
          dataResult.push(body);
        }
      }
      response.send(dataResult);
      response.end();
    }
  );
});

app.get("/check-info", function (request, response) {
  let booking = request.query.bookingid;
  connection.query(
    "SELECT ct.ctUserID, concat(ct.ctFirstName,' ',ct.ctLastName) as ctFullname, b.BookingID, r.RoomTypeID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkDeposit, b.bkGetPoint, b.bkReason, b.bkStatus, c.cIntime, c.cOuttime, rm.rImage FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join customerinfo ct on ct.ctUserID = b.ctUserID left join (select DISTINCT RoomTypeID, rImage from roominfo) rm on rm.RoomTypeID = r.RoomTypeID where b.BookingID = '" +
      booking +
      "'",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      let dataResult = [];
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          connection.query(
            "select ri.RoomID from roominfo ri where ri.RoomTypeID = ? and ri.rStatus = 'Empty' and ri.rCleaningState = 'Y'",
            [results[i].RoomTypeID],
            function (err, res) {
              let roomid = [];
              if (res.length > 0) {
                for (let i = 0; i < res.length; i++) {
                  roomid.push(res[i].RoomID);
                }
              }
              let body = {
                rowId: results[i].rowId,
                ctUserID: results[i].ctUserID,
                ctFullname: results[i].ctFullname,
                BookingID: results[i].BookingID,
                RoomTypeName: results[i].RoomTypeName,
                checkin: results[i].bkCheckInDate,
                checkout: results[i].bkLeaveDate,
                dcCode: results[i].dcCode,
                point: results[i].bkpointDiscount,
                price: results[i].bkTotalPrice,
                getPoint: results[i].bkGetPoint,
                reason: results[i].bkReason,
                status: results[i].bkStatus,
                cIntime: results[i].cIntime,
                cOuttime: results[i].cOuttime,
                image: results[i].rImage,
                deposit: results[i].bkDeposit,
                roomId: roomid,
              };
              dataResult.push(body);
              response.send(dataResult[0]);
              response.end();
            }
          );
        }
      } else {
        response.send({});
        response.end();
      }
    }
  );
});

app.get("/check-info-out", function (request, response) {
  let bookingid = request.query.bookingid;
  connection.query(
    "SELECT c.RoomID, c.cName, c.cIntime, c.cInpeople, r.rImage, b.bkCheckInDate, b.bkLeaveDate FROM checkinfo c left join roominfo r on r.RoomID = c.RoomID left join bookinginfo b on b.BookingID = c.BookingID where c.BookingID = ?",
    [bookingid],
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      let dataResult = [];
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          connection.query(
            "select p.pMethod, p.pDate from paymentinfo p where p.BookingID = ? order by p.pChargesID desc limit 1",
            [bookingid],
            function (err, res) {
              let body = {
                RoomID: results[i].RoomID,
                cName: results[i].cName,
                cIntime: results[i].cIntime,
                cInpeople: results[i].ctFullname,
                BookingID: results[i].BookingID,
                paymentMethod: res[0].pMethod,
                paymentDate: res[0].pDate,
                rImage: results[i].rImage,
                checkin: results[i].bkCheckInDate,
                checkout: results[i].bkLeaveDate,
              };
              dataResult.push(body);
              response.send(dataResult[0]);
              response.end();
            }
          );
        }
      } else {
        response.send({});
        response.end();
      }
    }
  );
});

app.post("/check-in", function (request, response) {
  let booking = request.body.bookingid;
  let staffid = request.body.staffid;
  let cInpeople = request.body.cInpeople;
  let cName = request.body.cName;
  let room = request.body.room;
  connection.query(
    "INSERT INTO checkinfo(cName, RoomID, cInpeople, BookingID, StaffID) VALUES (?,?,?,?,?)",
    [cName, room, cInpeople, booking, staffid],
    function (error, res) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      connection.query(
        "UPDATE roominfo SET rStatus= 'CHECK-IN' WHERE RoomID = ?",
        [room]
      );
      response.sendStatus(200);
      response.end();
    }
  );
});

app.put("/check-out", function (request, response) {
  let booking = request.body.bookingid;
  let room = request.body.room;
  connection.query(
    "UPDATE checkinfo SET cOuttime=CURRENT_TIMESTAMP where BookingID = ?",
    [booking],
    function (error, res) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      connection.query(
        "UPDATE roominfo SET rStatus= 'Empty', rCleaningState = 'N' WHERE RoomID = ?",
        [room]
      );
      response.sendStatus(200);
      response.end();
    }
  );
});

//add the router
app.use("/", router);
app.listen(process.env.port || 3001);

console.log("Running at Port 3001");
