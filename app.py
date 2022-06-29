import sqlite3
import pandas as pd
from flask import Flask, jsonify, request
from flask import render_template, redirect, url_for
import json

# Create or connect to database
connection = sqlite3.connect('nitrous.db')

# Create or connect to tables
cursor = connection.cursor()
cursor.execute('''
               CREATE TABLE IF NOT EXISTS hospitals (
               [name] TEXT PRIMARY KEY, [address] TEXT,
               [suburb] TEXT, [postcode] INTEGER, [state] TEXT,
               [country] TEXT, [lat] FLOAT, [long] FLOAT,
               [hosp_type] TEXT, [region] TEXT, [cases_adult] INTEGER,
               [cases_obs], INTEGER, [cases_paed] INTEGET, [cases_burns] INTEGER,
               [supplier] TEXT, [maintenance] TEXT, [diagram] TEXT, [outlets] TEXT)
              ''')

cursor.execute("""
               CREATE TABLE IF NOT EXISTS manifolds (
               [name] TEXT, [cylinder_f8] INTEGER, [cylinder_f9] INTEGER, 
               [cylinder_g] INTEGER, [date] TEXT,
               PRIMARY KEY (name, date)) 
               """)

cursor.execute("""
               CREATE TABLE IF NOT EXISTS purchases (
               [name] TEXT, [cylinder_c] INTEGER, [cylinder_d] INTEGER,
               [cylinder_E] INTEGER, [cylinder_f8] INTEGER, [cylinder_f9] INTEGER, 
               [cylinder_g] INTEGER, [date] TEXT, [total_n2o] FLOAT)
               """)

connection.commit()
connection.close()


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


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

    street = request.form.get('street')
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


    with sqlite3.connect("nitrous.db") as con:
        cur = con.cursor()
        
        sql_hospital = ''' 
                INSERT INTO hospitals(name,address,suburb,postcode,state,country,
                lat,long,hosp_type,region,cases_adult,cases_obs,cases_paed,cases_burns,
                supplier,maintenance,diagram,outlets)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
                '''

        sql_manifold = '''
                INSERT INTO manifolds(name, cylinder_f8, cylinder_f9, cylinder_g, date)  
                VALUES(?,?,?,?,?) 
                '''   

        new_hospital = (name,street,suburb,postcode,state,country,lat,long,hosp_type,region,
                        cases_adult,cases_obs,cases_paed,cases_burns,supplier,maintenance,
                        diagram, outlets)

        new_manifold = (name, cylinder_f8, cylinder_f9, cylinder_g, date)
        
        print(new_hospital)
        try:      
            cur.execute(sql_hospital, new_hospital)
            cur.execute(sql_manifold, new_manifold)
        except sqlite3.IntegrityError:
            alert = [name, 'already exists in the database']
            return render_template('addHospital.html', alert=alert)


        con.commit()
        msg = "Record successfully added"
        print(msg)
   



    return render_template("confirmation.html", data=new_hospital, manifold_data=new_manifold)


@app.route("/newpurchase")
def newpurchase():
    
    # Connect to database
    connection = sqlite3.connect('nitrous.db')

    # Connect to tables
    cursor = connection.cursor()

    cursor.execute('''SELECT * FROM hospitals''')
    data = cursor.fetchall()

    cursor.execute('''SELECT * FROM purchases''')
    purchase_data = cursor.fetchall()

    connection.close()    

    # Return template and data
    return render_template("addPurchase.html", data=data, purchase_data=purchase_data) 



@app.route('/submitPurchase', methods=['GET', 'POST'])
def submitPurchase():
    req = request.json
        
    hospital = req[0]['hospitalName']
    print(hospital)

    with sqlite3.connect("nitrous.db") as con:
    
        cursor = con.cursor()

        # Delete the current table data for this hospital
        sql_delete = f"""
                      DELETE FROM purchases
                      WHERE name = '{hospital}'
                      """
        cursor.execute(sql_delete)
        con.commit()
        print("All records successfully deleted")

        sql_purchases = ''' 
                        INSERT INTO purchases(name,cylinder_c,cylinder_d,
                        cylinder_e,cylinder_f8,cylinder_f9,cylinder_g,date,total_n2o)
                        VALUES(?,?,?,?,?,?,?,?,?) 
                        '''
        
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
            
            new_purchase = (hospital, cylinder_c, cylinder_d, cylinder_e, 
                            cylinder_f8, cylinder_f9, cylinder_g, date, total)
            
            cursor.execute(sql_purchases, new_purchase)
            con.commit()    

            msg = "Record successfully added"
            print(msg)  

        cursor.execute('''SELECT * FROM purchases''')
        new_data = cursor.fetchall()

        return json.dumps(new_data)


@app.route("/edit")
def editHospital():

    # Connect to database
    connection = sqlite3.connect('nitrous.db')

    # Connect to tables
    cursor = connection.cursor()

    cursor.execute('''SELECT * FROM hospitals''')
    data = cursor.fetchall()

    cursor.execute('''SELECT * FROM manifolds''')
    manifold_data = cursor.fetchall()

    cursor.execute('''SELECT * FROM purchases''')
    purchase_data = cursor.fetchall()

    connection.close()    

    # Return template and data
    return render_template("edit.html", data=data, manifold_data=manifold_data, purchase_data=purchase_data)  


@app.route("/submitEdit", methods=['POST'])
def submitEdit():
    req = request.json

    hospital = req[0]['name']
    tables = ['hospitals', 'manifolds', 'purchases']
    
    with sqlite3.connect("nitrous.db") as con:
        
        cursor = con.cursor()

        for table in tables:
            # Delete the current table data for this hospital
            sql_delete = f"""
                        DELETE FROM {table}
                        WHERE name = '{hospital}'
                        """
            cursor.execute(sql_delete)
            con.commit()
            print(f"{table} table successfully deleted")
       
        
        sql_hospital = ''' 
        INSERT INTO hospitals(name,address,suburb,postcode,state,country,
        lat,long,hosp_type,region,cases_adult,cases_obs,cases_paed,cases_burns,
        supplier,maintenance,diagram,outlets)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
        '''
        sql_manifold = '''
                INSERT INTO manifolds(name, cylinder_f8, cylinder_f9, cylinder_g, date)  
                VALUES(?,?,?,?,?) 
                '''  

        sql_purchases = ''' 
                        INSERT INTO purchases(name,cylinder_c,cylinder_d,
                        cylinder_e,cylinder_f8,cylinder_f9,cylinder_g,date,total_n2o)
                        VALUES(?,?,?,?,?,?,?,?,?) 
                        '''
        
        new_hospital = [(hospital, req[0]['address'], req[0]['suburb'], req[0]['postcode'], 
                        req[0]['state'], req[0]['country'], req[0]['lat'], req[0]['long'],
                        req[0]['hosp_type'], req[0]['region'], req[0]['cases_adult'], 
                        req[0]['cases_obs'], req[0]['cases_paed'], req[0]['cases_burns'], 
                        req[0]['supplier'], req[0]['maintenance'], req[0]['diagram'], req[0]['outlets'])]

        new_manifold = []
        for i in range(0, len(req[1])):
            current_row = (hospital, req[1][i]['cylinder_f8'], req[1][i]['cylinder_f9'], 
                        req[1][i]['cylinder_g'], req[1][i]['date'])
            new_manifold.append(current_row)
        if len(new_manifold) == 0:
            current_row = (hospital, 0, 0, 0, 'DD/MM/YYYY')
            new_manifold.append(current_row)

        print(new_manifold)
        
        new_purchase = []
        for i in range(0, len(req[2])):
            current_row = (hospital, req[2][i]['cylinder_c'], req[2][i]['cylinder_d'], req[2][i]['cylinder_e'], 
                        req[2][i]['cylinder_f8'], req[2][i]['cylinder_f9'], req[2][i]['cylinder_g'], 
                        req[2][i]['date'], req[2][i]['total'])
            new_purchase.append(current_row)
        if len(new_purchase) == 0:
            current_row = (hospital, 0, 0, 0, 8, 8, 8, 'DD/MM/YYYY', 0)
            new_purchase.append(current_row)

        print(len(new_purchase))
    
        cursor.executemany(sql_hospital, new_hospital)
        cursor.executemany(sql_manifold, new_manifold)
        cursor.executemany(sql_purchases, new_purchase)
        
        con.commit()  
    
    # Pull all data to send back
    con = sqlite3.connect('nitrous.db')
    
    cursor = con.cursor()
    
    cursor.execute('''SELECT * FROM hospitals''')
    data = cursor.fetchall()

    cursor.execute('''SELECT * FROM manifolds''')
    manifold_data = cursor.fetchall()

    cursor.execute('''SELECT * FROM purchases''')
    purchase_data = cursor.fetchall()

    con.close()  

    return_data = [{0:data, 1:manifold_data, 2:purchase_data}]
    
    return(jsonify(return_data))


if __name__ == '__main__':
    app.run(port=5000, debug=True)