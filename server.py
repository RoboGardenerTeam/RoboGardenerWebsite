from flask import Flask, render_template, session, request, redirect, url_for, flash, send_from_directory
import requests
from functools import wraps
from requests_ntlm import HttpNtlmAuth
from config import allowed_accounts, scan_status
import sys
from threading import Thread

app = Flask(__name__,static_url_path='')
app.secret_key = 'oRaNg3_tO_b@rDz0_fAJJJn@@@ff1RmA!'

ROBOT_PORT = 5001
robot_url="http://localhost:"+ str(ROBOT_PORT)


################################################################
################################################################
###################### USER INTERFACE ##########################
################################################################


@app.route('/assets/<path:path>')
def send_js(path):
    return send_from_directory('assets', path)

# A handler that ensures user is logged in
def authenticated_resource(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('user') in allowed_accounts:
            return f(*args, **kwargs)
        else:
            flash('Please log in first')
            return redirect(url_for('home'), code=302)

        return redirect(url_for('do_admin_login'), code=302)

    return decorated

@app.route('/login', methods=['POST'])
def do_admin_login():
    if request.form['email'] in allowed_accounts:
        sesh = requests.Session()
        sesh.verify = False
        sesh.auth = HttpNtlmAuth(
            request.form['email'], request.form['password'])
        #url = 'https://poczta.corpnet.pl/api/v2.0/me/MailFolders'
        #r = sesh.get(url)
        # print(time.strftime("[%Y-%m-%d %H:%M:%S %z] [proxima] ") + str(request.form['user']) + " login attempt gave a " + str(r.status_code) + " response.")
        if True: #r.status_code == 200:
            session['logged_in'] = True
            session['user'] = request.form['email']
        else:
            flash('Wrong login or password.')
    else:
        flash('This account does not exist.')

    return redirect(url_for('home'), code=302)


@app.route("/logout")
def logout():
    session['logged_in'] = False
    session['user'] = None
    return redirect(url_for('home'), code=302)


@app.route('/')
def home():
    if not session.get('logged_in'):
        return render_template('login.html', title="Log in", logged_in=False)
    else:
        return render_template('status.html',
                               title='Status',
                               logged_in=True,
                               user=session['user'])

@app.route('/register')
def register():
    return render_template(
        'register.html', 
        title='Register',
        user=session['user']
        )

@app.route('/schedule')
@authenticated_resource
def schedule():
    return render_template(
        'schedule.html', 
        title='Schedule',
        user=session['user']
        )

@app.route('/settings')
@authenticated_resource
def settings():
    return render_template(
        'settings.html', 
        title='Settings',
        user=session['user']
        )

@app.route('/status')
@authenticated_resource
def status():
    return render_template(
        'status.html', 
        title='Status',
        user=session['user'],
        scan_started=scan_status['started'],
        scan_progress = scan_status['progress']
        )

################################################################
################################################################
######################### API CALLS ############################
################################################################

@app.route('/startScan')
@authenticated_resource
def startScan():
    scan_status['started'] = True
    scan_status['progress'] = requests.get(robot_url + "/start").json()['message']
    # scan_status['progress'] = "hello"
    return redirect(url_for('status'), code=302)

@app.route('/cancelScan')
@authenticated_resource
def cancelScan():
    scan_status['started'] = False
    scan_status['progress'] = requests.get(robot_url + "/gohome").json()['message']
    return redirect(url_for('status'), code=302)

@app.route('/pauseScan')
@authenticated_resource
def pauseScan():
    scan_status['started'] = True
    scan_status['progress'] = requests.get(robot_url + "/pause").json()['message']
    return redirect(url_for('status'), code=302)

@app.route('/continueScan')
@authenticated_resource
def continueScan():
    scan_status['started'] = True
    scan_status['progress'] = requests.get(robot_url + "/continue").json()['message']
    return redirect(url_for('status'), code=302)

@app.route('/batteryLevel')
@authenticated_resource
def battery():
    battery_level = (requests.get(robot_url + "/battery").json()['message'])
    battery_level = str(int(battery_level*100))
    return battery_level

@app.route('/scanStatus')
@authenticated_resource
def scanStatus():
    scan_status = (requests.get(robot_url + "/status").json()['message'])
    return scan_status

if __name__ == "__main__":
    # we assume the robot is always on port 5001
    app.run(port=5000)
