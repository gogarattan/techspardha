const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database().ref();

exports.addEvent = functions.https.onRequest((req,res) => {

    let eventCategory = req.body.eventCategory;
    let eventName = req.body.eventName;
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let eventDescription = req.body.eventDescription;

    db.child(`events/${eventCategory}/${eventName}`).set({

        name : eventName,
        startTime : startTime,
        endTime : endTime
    })
    .then((snapshot) => {
        console.log('done')
    }).catch((err) => {
        res.send(err)
    })

    db.child(`eventDescription/${eventCategory}/${eventName}`).set({

        name : eventName,
        eventDescription : eventDescription,
        startTime : startTime,
        endTime : endTime
    }).then((snapshot) => {
        return res.send(snapshot.val())
    }).catch((err) => {
        return res.send(err)
    }) 
})

exports.getCategories = functions.https.onRequest((req,res) => {

    return db.child('events').once('value')
    .then((snapshot) => {
        
        var data = {categories : []}
        for(var i in snapshot.val())
        {
            var obj = {};
            obj.name = i;
            data.categories.push(obj);
        }
        return res.send(data);
    })
    .catch((err) => {
        return res.send(err);
    })
})

exports.getEventNames = functions.https.onRequest((req,res) => {

    if(req.query.category == 'all')
    {
        return db.child('events').once('value')
        .then((snapshot) => {
            
            var data = {events : []}
            var database=snapshot.val();
            for(var category in database)
            {
                for(let event in database[category])
                {
                    var obj = {};
                    obj.category = category,
                    obj.name = database[category][event].name;
                    data.events.push(obj);
                }
            }

            return res.send(data);
        })
        .catch((err) => {
            return res.send(err);
        })
    }
    else if(req.query.category == 'one')
    {
        let cat = req.query.eventCategory;
        return db.child(`events/${cat}`).once('value')
        .then((snapshot) => {

            return res.send(snapshot);
        })
    }
    else {
        return res.send("Invalid parameters.");
    }
})

exports.getEventDescription = functions.https.onRequest((req,res) => {

    if(req.query.events == 'all')
    {
        return db.child('eventDescription').once('value')
        .then((snapshot) => {

            var data = {eventDesciption : []}
            var database = snapshot.val();

            for(var category in snapshot.val()){

                var events=database[category];

                for(var event in events)
                {
                    var obj = {};
                    obj.category = category;
                    obj.name = events[event].name;
                    obj.eventDescription = events[event].eventDescription;
                    obj.startTime = events[event].startTime;
                    obj.endTime = events[event].endTime;
                    data.eventDesciption.push(obj);
                }
            }
            return res.send(data);
        })
        .catch((err) => {
            return res.send(err)
        })
    }
    else if(req.query.events == 'one')
    {
        let eventCategory = req.query.eventCategory
        let eventName = req.query.eventName

        if(eventCategory == null || eventName == null) {
            res.send("Insufficient parameters.")
        }

        db.child(`eventDescription/${eventCategory}/${eventName}`).once('value')
        .then((snapshot) => {
            if(snapshot == null) {
                return res.send("Event Doesn't Exist.");
            }
            return res.send(snapshot.val())
        })
        .catch((err) => {
            return res.send(err)
        })
    }
    else if(req.query.events == 'cat')
    {
        let categoryName = req.query.eventCategory;
        if(categoryName == null)
        {
            return res.send("Insufficient Parameters.");
        }

        db.child(`eventDescription/${categoryName}`).once('value')
        .then((snapshot) => {
            if(snapshot == null) {
                return res.send("Invalid Category.");
            }

            return res.send(snapshot.val());
        })
    }
    
})

exports.getEventTimeline = functions.https.onRequest((req,res) => {

    return db.child('events').once('value')
    .then((snapshot) => {
        return res.send(snapshot.val())
    })
    .catch((err) => {
        return res.send(err)
    })
})

