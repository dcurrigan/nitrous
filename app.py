import sqlite3
import pandas as pd
from flask import Flask, jsonify, request
from flask import render_template, redirect, url_for
import json
from flask_sqlalchemy import SQLAlchemy


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://xvgqssimiaylqo:91d15f5f6ca8c1040e8c893a726d452048416d88a86a65ab4d8603ab4ac8990f@ec2-44-206-89-185.compute-1.amazonaws.com:5432/d8uun7vml6l2na'

#################################################
# Initialise Database and create DB model
#################################################
db = SQLAlchemy(app)

class Hospitals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(200))
    suburb = db.Column(db.String(200))
    postcode = db.Column(db.String(200))
    state = db.Column(db.String(200))
    country = db.Column(db.String(200))
    lat = db.Column(db.Float)
    long = db.Column(db.Float)
    hosp_type = db.Column(db.String(200))
    region = db.Column(db.String(200))
    cases_adult = db.Column(db.Integer)
    cases_obs = db.Column(db.Integer)
    cases_paed = db.Column(db.Integer)
    cases_burns = db.Column(db.Integer)
    supplier = db.Column(db.String(200))
    maintenance = db.Column(db.String(200))
    diagram = db.Column(db.String(200))
    outlets = db.Column(db.String(200))

    def __repr__(self):
        return '<Name %r>' % self.id

class Manifolds(db.Model):
    manifold_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    cylinder_f8 = db.Column(db.Integer)
    cylinder_f9 = db.Column(db.Integer)
    cylinder_g = db.Column(db.Integer)
    date = db.Column(db.String(200))

    def __repr__(self):
        return '<Name %r>' % self.manifold_id

class Purchases(db.Model):
    purchase_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    cylinder_c = db.Column(db.Integer)
    cylinder_d = db.Column(db.Integer)
    cylinder_e = db.Column(db.Integer)
    cylinder_f8 = db.Column(db.Integer)
    cylinder_f9 = db.Column(db.Integer)
    cylinder_g = db.Column(db.Integer)
    date = db.Column(db.String(200))
    total = db.Column(db.Float)

    def __repr__(self):
        return '<Name %r>' % self.purchase_id

db.create_all()

#################################################
# Flask Routes
#################################################
@app.route("/")
def home():

    # Return template and data
    return render_template("index.html")


@app.route("/newhosp")
def newhosp():

    # Return template and data
    alert = ["Hospital Name", 'does_not_exist']
    
    return render_template("addHospital.html", alert = alert)   


@app.route('/submitData', methods=['POST'])
def submitData():

    name = request.form.get('hospital')

    if len(name) == 0:
        alert = ["", "Please enter a hospital name"]
        return render_template('addHospital.html', alert=alert)

    address = request.form.get('street')
    suburb = request.form.get('suburb')
    postcode = request.form.get('postcode')
    state = request.form.get('state')
    country = request.form.get('country')
    lat = request.form.get('lat')
    long = request.form.get('long')

    hosp_type = request.form.get('gridRadios1')
    region = request.form.get('gridRadios2')
    cases_adult = request.form.get('adult')
    cases_obs = request.form.get('obs')
    cases_paed = request.form.get('paeds')
    cases_burns = request.form.get('burns')

    cylinder_f8 = request.form.get('F8')
    cylinder_f9 = request.form.get('F9')
    cylinder_g = request.form.get('G')
    date = request.form.get('date')
    supplier = request.form.get('gridRadios3')
    maintenance = request.form.get('gridRadios4')
    diagram = request.form.get('gridRadios5')
    outlets = request.form.get('gridRadios6')

    new_hospital = Hospitals(name=name, address=address, suburb=suburb,
                             postcode=postcode, state=state, country=country,
                             lat=lat, long=long, hosp_type=hosp_type, region=region,
                             cases_adult=cases_adult, cases_obs=cases_obs, 
                             cases_paed=cases_paed, cases_burns=cases_burns, 
                             supplier=supplier, maintenance=maintenance, diagram=diagram,
                             outlets=outlets)

    new_manifold = Manifolds(name=name, cylinder_f8=cylinder_f8, cylinder_f9=cylinder_f9,
                             cylinder_g=cylinder_g, date=date)

    hosp_data = (name, address, suburb, postcode, state, country, lat, long, hosp_type, 
                 region, cases_adult,cases_obs,cases_paed,cases_burns,supplier,maintenance,
                 diagram, outlets)

    manifold_data = (name, cylinder_f8, cylinder_f9, cylinder_g, date)

    try:
        db.session.add(new_hospital)
        db.session.add(new_manifold)
        db.session.commit()
        return render_template("confirmation.html", data=hosp_data, manifold_data=manifold_data)   
    except:
        alert = [name, 'already exists in the database']
        return render_template('addHospital.html', alert=alert) 



@app.route("/newpurchase")
def newpurchase():
    
    hosp_query = Hospitals.query.all()
    data = [u.__dict__ for u in hosp_query]
    for row in data:
        del row['_sa_instance_state']  

    purchase_query = Purchases.query.all()
    purchase_data = [u.__dict__ for u in purchase_query]
    for row in purchase_data:
        del row['_sa_instance_state']


    # Return template and data
    return render_template("addPurchase.html", data=data, purchase_data=purchase_data) 



@app.route('/submitPurchase', methods=['GET', 'POST'])
def submitPurchase():
    req = request.json
        
    hospital = req[0]['hospitalName']


    # Delete the current table data for this hospital
    db.session.query(Purchases).filter(Purchases.name==hospital).delete()
    db.session.commit()
    
    
    # Add each purchase to the table 
    for i in range(1, len(req)):
        cylinder_c = req[i]['cylinder_c']
        cylinder_d = req[i]['cylinder_d']
        cylinder_e = req[i]['cylinder_e']
        cylinder_f8 = req[i]['cylinder_f8']
        cylinder_f9 = req[i]['cylinder_f9']
        cylinder_g = req[i]['cylinder_g']
        date = req[i]['date']
        total = req[i]['total']
        
        new_purchase = Purchases(name=hospital, cylinder_c=cylinder_c, cylinder_d=cylinder_d,
                                    cylinder_e=cylinder_e, cylinder_f8=cylinder_f8, cylinder_f9=cylinder_f9,
                                    cylinder_g=cylinder_g, date=date, total=total)

        db.session.add(new_purchase)
        db.session.commit()       

    purchase_query = Purchases.query.all()
    purchase_data = [u.__dict__ for u in purchase_query]
    for row in purchase_data:
        del row['_sa_instance_state']  
    
    return json.dumps(purchase_data)


@app.route("/edit")
def editHospital():

    hosp_query = Hospitals.query.all()
    data = [u.__dict__ for u in hosp_query]
    for row in data:
        del row['_sa_instance_state']  

    manifold_query = Manifolds.query.all()
    manifold_data = [u.__dict__ for u in manifold_query]
    for row in manifold_data:
        del row['_sa_instance_state']
   
    purchase_query = Purchases.query.all()
    purchase_data = [u.__dict__ for u in purchase_query]
    for row in purchase_data:
        del row['_sa_instance_state']


    # Return template and data
    return render_template("edit.html", data=data, manifold_data=manifold_data, purchase_data=purchase_data)  


@app.route("/submitEdit", methods=['POST'])
def submitEdit():
    req = request.json

    hospital = req[0]['name']
    tables = ['hospitals', 'manifolds', 'purchases']
    
    # Delete the current table data for this hospital
    db.session.query(Hospitals).filter(Hospitals.name==hospital).delete()
    db.session.query(Manifolds).filter(Manifolds.name==hospital).delete()
    db.session.query(Purchases).filter(Purchases.name==hospital).delete()
    db.session.commit()
    
    address = req[0]['address']
    suburb = req[0]['suburb']
    postcode = req[0]['postcode']
    state = req[0]['state']
    country = req[0]['country']
    lat = req[0]['lat']
    long = req[0]['long']

    hosp_type = req[0]['hosp_type']
    region = req[0]['region']
    cases_adult = req[0]['cases_adult']
    cases_obs = req[0]['cases_obs']
    cases_paed = req[0]['cases_paed']
    cases_burns = req[0]['cases_burns']

    supplier = req[0]['supplier']
    maintenance = req[0]['maintenance']
    diagram = req[0]['diagram']
    outlets = req[0]['outlets']
    
    new_hospital = Hospitals(name=hospital, address=address, suburb=suburb,
                             postcode=postcode, state=state, country=country,
                             lat=lat, long=long, hosp_type=hosp_type, region=region,
                             cases_adult=cases_adult, cases_obs=cases_obs, 
                             cases_paed=cases_paed, cases_burns=cases_burns, 
                             supplier=supplier, maintenance=maintenance, diagram=diagram,
                             outlets=outlets)
    
    db.session.add(new_hospital)
    db.session.commit()

    # Add each manifold to the table 
    for i in range(0, len(req[1])):
        cylinder_f8 = req[1][i]['cylinder_f8']
        cylinder_f9 = req[1][i]['cylinder_f9']
        cylinder_g = req[1][i]['cylinder_g']
        date = req[1][i]['date']

        new_manifold = Manifolds(name=hospital, cylinder_f8=cylinder_f8, cylinder_f9=cylinder_f9,
                                 cylinder_g=cylinder_g, date=date)

        db.session.add(new_manifold)
        db.session.commit()                          
    
    # Add each purchase to the table 
    for i in range(0, len(req[2])):
        cylinder_c = req[2][i]['cylinder_c']
        cylinder_d = req[2][i]['cylinder_d']
        cylinder_e = req[2][i]['cylinder_e']
        cylinder_f8 = req[2][i]['cylinder_f8']
        cylinder_f9 = req[2][i]['cylinder_f9']
        cylinder_g = req[2][i]['cylinder_g']
        date = req[2][i]['date']
        total = req[2][i]['total']
        
        new_purchase = Purchases(name=hospital, cylinder_c=cylinder_c, cylinder_d=cylinder_d,
                                    cylinder_e=cylinder_e, cylinder_f8=cylinder_f8, cylinder_f9=cylinder_f9,
                                    cylinder_g=cylinder_g, date=date, total=total)

        db.session.add(new_purchase)
        db.session.commit()       
     
    # Pull all current data to send back
    hosp_query = Hospitals.query.all()
    data = [u.__dict__ for u in hosp_query]
    for row in data:
        del row['_sa_instance_state']  

    manifold_query = Manifolds.query.all()
    manifold_data = [u.__dict__ for u in manifold_query]
    for row in manifold_data:
        del row['_sa_instance_state']
   
    purchase_query = Purchases.query.all()
    purchase_data = [u.__dict__ for u in purchase_query]
    for row in purchase_data:
        del row['_sa_instance_state']


    return_data = [{0:data, 1:manifold_data, 2:purchase_data}]
    
    return(jsonify(return_data))


if __name__ == '__main__':
    app.run(port=5000, debug=True)