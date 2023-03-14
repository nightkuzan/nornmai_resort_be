const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
// const Blob = require('blob');

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
  // done in ood
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
  //done in ood

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

app.get("/history", function (request, response) { //done in ood
  let userid = request.query.userid;
  connection.query(
    "SELECT ROW_NUMBER() OVER () as rowId, b.BookingID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, b.bkReason, b.bkStatus, case when c.cIntime is not null and c.cOuttime is not null and rw.ReviewID is null then 'Y' else 'N' end reviewOpen FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join reviewinfo rw on rw.BookingID = b.BookingID WHERE b.ctUserID='" +
      userid +
      "' order by b.BookingID desc",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        let dataResult = [];
        for (let i = 0; i < results.length; i++) {
          let body = {
            rowId: results[i].rowId,
            BookingID: results[i].BookingID,
            RoomTypeName: results[i].RoomTypeName,
            checkin: results[i].bkCheckInDate,
            checkout: results[i].bkLeaveDate,
            dcCode: results[i].dcCode,
            point: results[i].bkpointDiscount,
            price: results[i].bkTotalPrice,
            getPoint: results[i].bkGetPoint,
            cancelFlag: results[i].bkReason == null ? "N" : "Y",
            reason: results[i].bkReason,
            status: results[i].bkStatus,
            reviewOpen: results[i].reviewOpen,
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
  //done in ood
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

app.get("/room-booking", function (request, response) {
  let userid = request.query.userid;
  let bookingid = request.query.bookingid;
  connection.query(
    "SELECT b.BookingID, r.RoomTypeID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, b.bkReason, b.bkStatus, c.cIntime, c.cOuttime, c.RoomID FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID WHERE b.ctUserID='" +
      userid +
      "' AND b.BookingID='" +
      bookingid +
      "'",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        let dataResult = [];
        for (let i = 0; i < results.length; i++) {
          let body = {
            rowId: results[i].rowId,
            BookingID: results[i].BookingID,
            RoomTypeID: results[i].RoomTypeID,
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
            RoomID: results[i].RoomID,
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
    }
  );
});

app.post("/review-room", function (request, response) {
  let bookingid = request.body.bookingid;
  let review = request.body.review;
  let star = request.body.star;
  let roomid = request.body.roomid;
  let roomtype = request.body.roomtype;
  connection.query(
    "INSERT INTO reviewinfo(BookingID, rvComment, rvScore, RoomID) VALUES (?,?,?,?)",
    [bookingid, review, star, roomid],
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      connection.query(
        "UPDATE roominfo SET rRating=(select AVG(r.rvScore) from reviewinfo r where r.RoomID in (select RoomID from roominfo where RoomTypeID = ?)) where RoomTypeID = ?",
        [roomtype, roomtype]
      );
      response.sendStatus(200);
      response.end();
    }
  );
});
app.get("/room-admin", function (request, response) {
  //done in ood
  let dataResult = [];
  connection.query(
    "SELECT r.RoomID, N.RoomTypeName, r.rStatus, r.rfloor, r.rCleaningState, r.rNumBed, r.rCapacity, r.rSize, r.rDefaultPrice, r.rImage, r.rDescription, r.rRating,N.RoomTypeID  FROM roominfo r left join roomtype N on r.RoomTypeID = N.RoomTypeID",
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
            RoomTypeID: results[i].RoomTypeID,
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

app.get("/room-admin/roomid", function (request, response) {
  //done in ood
  // roomid from params in request
  let roomID = request.query.roomId;
  connection.query(
    "SELECT N.RoomTypeID, r.RoomID, N.RoomTypeName, r.rStatus, r.rfloor, r.rCleaningState, r.rNumBed, r.rCapacity, r.rSize, r.rDefaultPrice, r.rImage, r.rDescription, r.rRating  FROM roominfo r left join roomtype N on r.RoomTypeID = N.RoomTypeID WHERE r.RoomID = ?",
    [roomID],
    function (error, results) {
      if (error) {
        console.log(error);
      }

      if (results) {
        response.send(results);
        response.end();
      } else {
        response.sendStatus(400);
        response.end();
      }
    }
  );
});

app.put("/room-admin/edit", function (request, response) {
  //done in ood
  // let roomID = request.params.id;
  let roomID = request.body.RoomID;
  // let roomName = request.body.RoomTypeName;
  let rfloor = request.body.rfloor;
  let rNumbed = request.body.rNumBed;
  let rCapacity = request.body.rCapacity;
  let rDefaultPrice = request.body.rDefaultPrice;
  let rImage = request.body.rImage;
  let rDescription = request.body.rDescription;
  let rDefaultRoomID = request.body.rDefaultRoomID;
  let RoomTypeID = request.body.RoomTypeID;
  let rPrice = request.body.rPrice;
  connection.query(
    "UPDATE roominfo SET RoomID = ?, rfloor = ?, rNumBed = ?, rCapacity = ?, rDefaultPrice = ?, rImage = ?, rDescription = ?, RoomTypeID = ? WHERE RoomID = ?",
    [
      roomID,
      rfloor,
      rNumbed,
      rCapacity,
      rPrice,
      rImage,
      rDescription,
      RoomTypeID,
      rDefaultRoomID,
    ],
    function (error, results) {
      if (error) {
        console.log(error);
      }

      if (results) {
        response.sendStatus(200);
        response.end();
      }
    }
  );
});

app.get("/customer", function (request, response) {
  //done in ood
  let dataResult = [];
  connection.query(
    "SELECT c.ctUserID, c.ctEmail, c.ctTel, c.ctFirstName, c.ctLastName, c.ctGender, c.ctDOB, m.mbTypeName, c.ctPoint, c.ctTotalConsumption FROM customerinfo c left join membertype m on m.mbTypeID = c.mbTypeID",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            ctUserID: results[i].ctUserID,
            ctEmail: results[i].ctEmail,
            ctTel: results[i].ctTel,
            ctFirstName: results[i].ctFirstName,
            ctLastName: results[i].ctLastName,
            ctGender: results[i].ctGender,
            ctDOB: results[i].ctDOB,
            mbTypeName: results[i].mbTypeName,
            ctPoint: results[i].ctPoint,
            ctTotalConsumption: results[i].ctTotalConsumption,
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

app.post("/room-admin/create", function (request, response) {
  //done in ood
  // let raw = JSON.stringify({
  //   RoomID: this.state.RoomID,
  //   RoomTypeName: this.state.RoomTypeName,
  //   RoomPrice: this.state.RoomPrice,
  //   RoomFloor: this.state.RoomFloor,
  //   RoomDetail: this.state.RoomDetail,
  //   RoomImage: this.state.RoomImage,
  //   RoomBed: this.state.RoomBed,
  // }); this from front end

  let RoomID = request.body.RoomID;
  let RoomTypeName = request.body.RoomTypeName;
  let RoomPrice = request.body.RoomPrice;
  let RoomFloor = request.body.RoomFloor;
  let RoomImage = request.body.RoomImage;
  let RoomBed = request.body.RoomBed;
  let RoomCapacity = request.body.RoomCapacity;
  let RoomDetail = request.body.RoomDescription;

  RoomTypeName = RoomTypeName + " Room";
  let RoomTypeID;
  let RoomSize = 0;
  if (RoomTypeName == "Single Room") {
    RoomSize = 220;
    RoomTypeID = "R00001";
  } else if (
    RoomTypeName == "Standard Room" ||
    RoomTypeName == "Superior Room"
  ) {
    RoomSize = 300;
  } else if (RoomTypeName == "Presidentail Room") {
    RoomSize = 500;
    RoomTypeID = "R00004";
  }

  if (RoomTypeName == "Standard Room") {
    RoomTypeID = "R00002";
  }
  if (RoomTypeName == "Superior Room") {
    RoomTypeID = "R00003";
  }

  connection.query(
    "INSERT INTO roominfo (RoomID, RoomTypeID, rStatus, rfloor, rCleaningState, rNumBed, rCapacity, rSize, rDefaultPrice, rImage, rDescription, rRating) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      RoomID,
      RoomTypeID,
      "Empty",
      RoomFloor,
      "Y",
      RoomBed,
      RoomCapacity,
      RoomSize,
      RoomPrice,
      RoomImage,
      RoomDetail,
      5,
    ]
  );
  connection.query(
    "UPDATE roomtype SET RoomTotal = RoomTotal + 1, RoomAvailable = RoomAvailable + 1 WHERE RoomTypeName = ?",
    [RoomTypeName]
  );
  response.sendStatus(200);
  response.end();
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
  //done in ood
  let search = request.query.search;
  let condition = "WHERE b.bkStatus != 'CANCEL'";
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
    "SELECT ROW_NUMBER() OVER () as rowId, ct.ctUserID, concat(ct.ctFirstName,' ',ct.ctLastName) as ctFullname, b.BookingID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkGetPoint, b.bkReason, b.bkStatus, c.cIntime, c.cOuttime FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join customerinfo ct on ct.ctUserID = b.ctUserID " +
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
          };
          dataResult.push(body);
        }
      }
      response.send(dataResult);
      response.end();
    }
  );
});
app.post("/payment", function (request, response) {
  let booking = request.body.bookingid;
  let amount = request.body.amount;
  let date = request.body.date;
  let staffid = request.body.staffid;
  let status = request.body.status;
  let userid = request.body.userid;
  connection.query(
    "INSERT INTO paymentinfo(BookingID, pAmount, pDate, StaffID) VALUES (?,?,?,?)",
    [booking, amount, date, staffid],
    function (error, res) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      connection.query(
        "UPDATE bookinginfo SET bkStatus= ? WHERE BookingID = ?",
        [status, booking]
      );
      if (status === "FULLY PAID") {
        connection.query(
          "UPDATE customerinfo c set c.ctPoint = c.ctPoint + (select b.bkGetPoint from bookinginfo b where b.BookingID = ?), c.ctTotalConsumption = c.ctTotalConsumption + (select b.bkTotalPrice from bookinginfo b where b.BookingID = ?) where c.ctUserID = ?",
          [booking, booking, userid]
        );
        connection.query(
          "select c.ctTotalConsumption from customerinfo c where c.ctUserID = ?",
          [userid],
          function (error, results) {
            if (error) throw error;
            if (results.length > 0) {
              let ctTotalConsumption = results[0].ctTotalConsumption;
              let rank = "GU231";
              if (ctTotalConsumption > 0 && ctTotalConsumption < 30000) {
                rank = "SI232";
              } else if (ctTotalConsumption < 100000) {
                rank = "GO233";
              } else if (ctTotalConsumption > 100000) {
                rank = "PL234";
              }
              connection.query(
                "UPDATE customerinfo c set c.mbTypeID = ? WHERE c.ctUserID = ?",
                [rank, userid]
              );
            }
          }
        );
      }
      response.sendStatus(200);
      response.end();
    }
  );
});

app.get("/payment-info", function (request, response) {
  //done in ood
  let booking = request.query.bookingid;
  connection.query(
    "SELECT ct.ctUserID, concat(ct.ctFirstName,' ',ct.ctLastName) as ctFullname,b.bkTransfer, b.BookingID, r.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount, b.bkTotalPrice, b.bkDeposit, b.bkGetPoint, b.bkReason, b.bkStatus, c.cIntime, c.cOuttime, rm.rImage FROM bookinginfo b left join checkinfo c on b.BookingID = c.BookingID left join roomtype r on r.RoomTypeID = b.RoomTypeID left join customerinfo ct on ct.ctUserID = b.ctUserID left join (select DISTINCT RoomTypeID, rImage from roominfo) rm on rm.RoomTypeID = r.RoomTypeID where b.BookingID = '" +
      booking +
      "'",
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
            image: results[i].rImage,
            deposit: results[i].bkDeposit,
            bkTransfer: results[i].bkTransfer,
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

app.get("/staff", function (request, response) {
  //done in ood
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
  //done in ood
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
  //done in ood
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
  //done in ood
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
  //done in ood
  // done in ood
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

app.delete("/room", function (request, response) {
  let roomID = request.body.RoomID;
  let roomTypeID = request.body.RoomTypeID;
  // Ensure the input fields exists and are not empty
  if (roomID) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "DELETE FROM roominfo WHERE RoomID = ?",
      [roomID],
      function (error) {
        // If there is an issue with the query, output the error
        if (error) {
          throw error;
        } else {
          connection.query(
            "UPDATE roomtype SET RoomTotal = RoomTotal - 1, RoomAvailable= RoomAvailable-1 WHERE RoomTypeID = ?",
            [roomTypeID]
          );
          response.sendStatus(200);
          response.end();
        }
      }
    );
  } else {
    throw "error";
  }
});

app.get("/reserve-room", function (request, response) {
  let checkin = request.query.checkin;
  let checkout = request.query.checkout;
  let type = request.query.type;
  let id = request.query.roomID;

  var from = new Date(checkin);
  var to = new Date(checkout);

  // loop for every day
  let query =
    "select min(a.room_free) as roomFree, a.RoomTypeID, a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.rDescription,a.RoomID from (";
  for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
    let date = moment(day).format("YYYY-MM-DD");
    query +=
      "select r.RoomTotal - count(b.RoomTypeID) as room_free,ri.RoomID, r.RoomTypeID, r.RoomTypeName, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription from roomtype r " +
      "left join bookinginfo b  on b.RoomTypeID = r.RoomTypeID and '" +
      date +
      "' BETWEEN b.bkCheckInDate and b.bkLeaveDate and b.bkLeaveDate != '" +
      date +
      "' and b.bkStatus != 'CANCEL' " +
      "JOIN (SELECT DISTINCT RoomID, RoomTypeID, rDefaultPrice, rImage, rRating, rCapacity, rDescription, rfloor FROM roominfo) ri ON ri.RoomTypeID = r.RoomTypeID WHERE b.bkReason IS NULL " +
      "group by r.RoomTypeID, r.RoomTypeName, r.RoomTotal, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription ";
    if (day < to) {
      query += "UNION ";
    }
  }
  query +=
    ") a GROUP by a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.RoomTypeID, a.rDescription HAVING a.RoomTypeID='" +
    type +
    "' and a.RoomID='" +
    id +
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

app.get("/discount", function (request, response) { //done in ood
  let dcCode = request.query.dcCode;
  query = "SELECT dcRate FROM seasondiscount WHERE dcCode = '" +
  dcCode +
  "' AND (dcAmount > 0 OR dcAmount IS NULL) AND (dcStartDate <= " +
  "CURRENT_DATE" +
  " OR dcStartDate IS NULL) AND (dcEndDate >= " +
  "CURRENT_DATE" +
  " OR dcEndDate IS NULL)"
  // console.log(query);
  connection.query(
    // select dcRate from seasondiscount if dcCode = dcCode and( dcAmount > 0 or dcAmount = null )and (dcStartDate <= currentDate or dcStartDate = null) and (dcEndDate >= currentDate or dcEndDate = null)
     query
      ,
    function (error, results) {
      console.log();
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

app.put("/discount", function (request, response) { //done in ood
  let dcCode = request.body.dcCode;
  connection.query(
    "UPDATE seasondiscount SET dcAmount = dcAmount - 1 WHERE dcCode = '" +
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
  let roomID = request.body.roomID;
  let transferimg = request.body.transferimg;

  // Ensure the input fields exists and are not empty
  if (userid && roomType) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "INSERT INTO `bookinginfo`(`ctUserID`, `bkCheckInDate`, `bkLeaveDate`, `bkNumPeople`, `bkpointDiscount`, `bkTotalPrice`, `dcCode`, `bkDeposit`, `bkStatus`, `bkGetPoint`, `RoomTypeID`,`RoomID`,`bkTransfer`) VALUES (?,?,?,?,?,?,?,?,'NOT PAID',?,?,?,?)",
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
        roomID,
        transferimg,
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
  let rfloor = request.query.rfloor;
  let rtype = request.query.rtype;
  let rprice = request.query.rprice;
  let rcapacity = request.query.rcapacity;

  rtype = rtype + " Room";

  if (rfloor == "all") {
    rfloor = "";
  }
  if (rtype == "all Room") {
    rtype = "";
  }
  if (rprice == "all") {
    rprice = "";
  }
  if (rcapacity == "all") {
    rcapacity = "";
  }

  var from = new Date(checkin);
  var to = new Date(checkout);

  // loop for every day
  let query =
    "select min(a.room_free) as roomFree, a.RoomTypeID, a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.rDescription,a.RoomID from (";
  for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
    let date = moment(day).format("YYYY-MM-DD");
    query +=
      "select r.RoomTotal - count(b.RoomTypeID) as room_free,ri.RoomID, r.RoomTypeID, r.RoomTypeName, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription from roomtype r " +
      "left join bookinginfo b  on b.RoomTypeID = r.RoomTypeID and '" +
      date +
      "' BETWEEN b.bkCheckInDate and b.bkLeaveDate and b.bkLeaveDate != '" +
      date +
      "' and b.bkStatus != 'CANCEL' " +
      "JOIN (SELECT DISTINCT RoomID, RoomTypeID, rDefaultPrice, rImage, rRating, rCapacity, rDescription, rfloor FROM roominfo) ri ON ri.RoomTypeID = r.RoomTypeID WHERE b.bkReason IS NULL ";

    if (rtype != "") {
      query += "and r.RoomTypeName = " + "'" + rtype + "'" + " ";
    }
    if (rfloor != "") {
      query += "and ri.rfloor like " + "'" + rfloor + "%'" + " ";
    }
    if (rcapacity != "") {
      query += "and ri.rCapacity = " + "'" + rcapacity + "'" + " ";
    }
    if (rprice != "") {
      // price is range ex. 1000-2000
      let price = rprice.split("-");
      let min = price[0];
      let max = price[1];
      // cast to int
      min = parseInt(min);
      max = parseInt(max);
      query += "and ri.rDefaultPrice between " + min + " and " + max + " ";
    }
    query +=
      "group by r.RoomTypeID, r.RoomTypeName, r.RoomTotal, ri.rDefaultPrice, ri.rImage, ri.rRating, ri.rCapacity, ri.rDescription, ri.RoomID ";
    if (day < to) {
      query += "UNION ";
    }
  }
  query +=
    ") a GROUP by a.RoomTypeName, a.rDefaultPrice, a.rImage, a.rRating, a.rCapacity, a.RoomTypeID, a.rDescription, a.RoomID order by a.rDefaultPrice";

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
          roomID: results[i].RoomID,
        };
        dataResult.push(body);
      }
      response.send(dataResult);
      // console.log(query);
      response.end();
    } else {
      response.sendStatus(400);
      response.end();
    }
    response.end();
  });
});

app.get("/review-cancel-info", function (request, response) {
  let bookingid = request.query.bookingid;
  ResultData = [];
  connection.query(
    "SELECT DISTINCT b.bkCheckInDate, b.bkLeaveDate, rt.RoomTypeName, b.bkTotalPrice, b.dcCode, b.bkpointDiscount, cn.RoomID FROM bookinginfo b left join roomtype rt on b.RoomTypeID = rt.RoomTypeID left join checkinfo cn on b.BookingID = cn.BookingID WHERE b.BookingID=?",
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
            roomid: results[0].RoomID,
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

app.post("/discount-info", function (request, response) { //
  let dcCode = request.body.dcCode;
  let dcRate = request.body.dcRate;
  let dcStartDate = request.body.dcStartDate;
  let dcEndDate = request.body.dcEndDate;
  let dcAmount = request.body.dcAmount;
  if (dcAmount == "-") {
    dcAmount = null;
  }
  console.log(dcStartDate);

  if (dcStartDate == 'Invalid date') {
    dcStartDate = null;
  }
  if (dcEndDate == 'Invalid date') {
    dcEndDate = null;
  }

  if (moment(dcStartDate).format('yyyy-mm-dd') == '1970-01-01') {
    dcStartDate = null;
    dcEndDate = null;

  }


  // cast amount to int
  // dcAmount = parseInt(dcAmount);

  // cast type stirng to date
  // dcStartDate = new Date(dcStartDate);
  // dcEndDate = new Date(dcEndDate);

  // if(dcStartDate ==='1999-01-01') {
  //   dcStartDate = null;
  // }
  // if(dcEndDate ==='2500-01-01') {
  //   dcEndDate = null;
  // }

  console.log(dcStartDate);

  connection.query(
    "UPDATE seasondiscount SET dcRate = ?, dcStartDate = ?, dcEndDate = ?, dcAmount = ? WHERE dcCode = ?",
    [dcRate, dcStartDate, dcEndDate, dcAmount, dcCode],
    function (error) {
      // If there is an issue with the query, output the error
      if (error) {
        throw error;
      } 
      else {
        let body = {
          status: "success",
        };
        response.send(body);
        response.end();
      }
    }
  );
});

app.get("/discount-info", function (request, response) { //
  let dataResult = [];
  connection.query(
    "SELECT s.dcCode, s.dcRate, s.dcStartDate, s.dcEndDate, s.dcAmount FROM seasondiscount s where s.dcCode !='NONE' order by s.dcEndDate desc",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let body = {
            dcCode: results[i].dcCode,
            dcRate: results[i].dcRate,
            startDate: results[i].dcStartDate,
            endDate: results[i].dcEndDate,
            dcAmount: results[i].dcAmount,
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

app.post("/discount/add", function (request, response) { //
  let dcCode = request.body.dcCode;
  let dcRate = request.body.dcRate;
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let dcAmount = request.body.dcAmount;
  let amountOrdate = request.body.amountOrdate;
  if (amountOrdate === "amount" || amountOrdate === "both") {
    dcAmount = parseInt(dcAmount);
  }
  // Ensure the input fields exists and are not empty
  if (dcCode && dcRate) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "INSERT INTO seasondiscount(dcCode, dcRate, dcStartDate, dcEndDate,dcAmount) VALUES (?,?,?,?,?)",
      [dcCode, dcRate, startDate, endDate, dcAmount],
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
      "UPDATE bookinginfo SET bkReason=?, bkStatus=? WHERE BookingID = ?",
      [reason, "Cancel", bookingid],
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

app.delete("/cancel-room", function (request, response) { //done in ood
  let userid = request.body.userid;
  let bookingid = request.body.bookingid;
  let reason = request.body.reason;
  connection.query(
    "SELECT b.bkStatus FROM bookinginfo b WHERE b.ctUserID='" +
      userid +
      "' AND b.BookingID='" +
      bookingid +
      "'",
    function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        if (results[0].bkStatus === "NOT PAID") {
          connection.query(
            "UPDATE bookinginfo b  SET b.bkReason = '" +
              reason +
              "', b.bkStatus = 'CANCEL' WHERE b.ctUserID='" +
              userid +
              "' AND b.BookingID='" +
              bookingid +
              "' AND b.bkStatus = 'NOT PAID'"
          );
          connection.query(
            "UPDATE customerinfo SET ctPoint=ctPoint+(select bkpointDiscount from bookinginfo where BookingID='" +
              bookingid +
              "') WHERE ctUserID='" +
              userid +
              "'"
          );
          response.status(200).json({ message: "ok" });
          response.end();
        } else {
          response.sendStatus(400);
          response.end();
        }
      } else {
        response.sendStatus(400);
        response.end();
      }
      response.end();
    }
  );
});
app.get("/check", function (request, response) { //done in ood
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

app.get("/check-info", function (request, response) {//done in ood
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

app.get("/check-info-out", function (request, response) { //done in ood
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
            "select p.pDate from paymentinfo p where p.BookingID = ? order by p.pChargesID desc limit 1",
            [bookingid],
            function (err, res) {
              let body = {
                RoomID: results[i].RoomID,
                cName: results[i].cName,
                cIntime: results[i].cIntime,
                cInpeople: results[i].ctFullname,
                BookingID: results[i].BookingID,
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

app.post("/check-in", function (request, response) { //done in ood
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

app.put("/check-out", function (request, response) { //done in ood
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

app.get("/allbooking", function (request, response) { //done in ood
  //done in ood
  let dataResult = [];
  connection.query(
    "SELECT b.ctUserID, ct.ctFirstName, ct.ctLastName, b.BookingID, rt.RoomTypeName, b.bkCheckInDate, b.bkLeaveDate, b.dcCode, b.bkpointDiscount,b.bkTotalPrice, b.bkGetPoint, cn.cIntime, cn.cOuttime, b.bkReason, b.bkStatus, rn.rvComment, rn.rvScore FROM bookinginfo b left join reviewinfo rn on b.BookingID=rn.BookingID left join checkinfo cn on cn.BookingID=b.BookingID left join roomtype rt on b.RoomTypeID=rt.RoomTypeID left join customerinfo ct on ct.ctUserID=b.ctUserID ORDER BY b.BookingID ASC",
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
            reason: results[i].bkReason,
            bkstatus: results[i].bkStatus,
            review: results[i].rvComment,
            rate: results[i].rvScore,
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

//add the router
app.use("/", router);
app.listen(process.env.port || 3001);

console.log("Running at Port 3001");
