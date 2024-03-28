from flask import Flask, render_template, jsonify, request
from midtransclient import Snap, CoreApi
from datetime import datetime
import uuid
import json
import os
import time  

app = Flask(__name__)


# @TODO: Change/fill the following API Keys variable with Your own server & client keys
# You can find it in Merchant Portal -> Settings -> Access keys
SERVER_KEY = 'SB-Mid-server-YsCycVU2yPG1pQVs0LkfQoMd'
CLIENT_KEY = 'SB-Mid-client-OZMRbYwO_9h3ehv8'
# Note: by default it uses hardcoded sandbox demo API keys for demonstration purpose

app = Flask(__name__)

# Dapatkan jalur lengkap ke folder 'templates'
template_dir = os.path.abspath('templates')

def generate_unique_id():
    return str(uuid.uuid4())

def save_order_data(total_price, total_quantity, menus):
    order_data = {
        "totalPrice": total_price,
        "totalQuantity": total_quantity,
        "menus": menus
    }
    with open('templates/data/order_data.json', 'w') as file:
        json.dump(order_data, file)


@app.route('/bayar', methods=['POST'])
def bayar():
    try:
        # Ambil data pembayaran dari request
        total_harga = request.form.get('totalHarga')
        total_quantity = request.form.get('totalQuantity')
        menus = json.loads(request.form.get('menus'))

        # Tambahkan tanggal, waktu, hari, bulan, dan tahun saat ini ke dalam data
        now = datetime.now()
        tanggal = now.strftime("%Y-%m-%d %H:%M:%S")
        hari = now.strftime("%A")
        bulan = now.strftime("%B")
        tahun = now.strftime("%Y")

        # Membuat objek data pembayaran
        payment_data = {
            "id_transaksi": generate_unique_id(),  # Fungsi untuk menghasilkan ID transaksi unik
            "tanggal": tanggal,
            "hari": hari,
            "bulan": bulan,
            "tahun": tahun,
            "totalHarga": total_harga,
            "totalQuantity": total_quantity,
            "menus": menus
        }

        # Simpan data pembayaran ke dalam file database.json
        database_file = 'templates/data/database.json'
        with open(database_file, 'a') as file:
            # Menyimpan setiap objek pembayaran sebagai array di dalam file
            file.write(json.dumps(payment_data) + '\n')

        # Respon sukses
        return jsonify({"status": "success", "message": "Data pembayaran berhasil disimpan ke database"})
    except Exception as e:
        # Respon error jika terjadi kesalahan
        return jsonify({"status": "error", "error_message": str(e)})



@app.route('/kasir')
def kasir():
    return render_template('kasir.html')

@app.route('/')
def index():
    if not SERVER_KEY or not CLIENT_KEY:
        # non-relevant function only used for demo/example purpose
        return printExampleWarningMessage()

    return render_template('index.html')
def printExampleWarningMessage():
    pathfile = os.path.abspath("web.py")
    message = "<code><h4>Please set your server key and client key from sandbox</h4>In file: " + pathfile
    message += "<br><br># Set Your server key"
    message += "<br># You can find it in Merchant Portal -> Settings -> Access keys"
    message += "<br>SERVER_KEY = ''"
    message += "<br>CLIENT_KEY = ''</code>"
    return message


@app.route('/pembayaran.html')
def pembayaran():
    try:
        snap = Snap(
            is_production=False,
            server_key=SERVER_KEY,  # Pastikan SERVER_KEY dan CLIENT_KEY sudah didefinisikan sebelumnya
            client_key=CLIENT_KEY
        )
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Ambil nilai totalHarga dari permintaan HTTP
        total_harga = request.args.get('totalHarga')

        # Pastikan total_harga tidak kosong dan adalah angka
        if total_harga is None or not total_harga.isdigit():
            return "Invalid totalHarga value"

        # Buat token transaksi dengan total_harga yang diterima
        transaction_token = snap.create_transaction_token({
            "transaction_details": {
                "order_id": "order-id-python-" + timestamp,
                "gross_amount": int(total_harga)
            },
            "credit_card": {
                "secure": True
            }
        })
        return render_template('pembayaran.html', token=transaction_token, client_key=snap.api_config.client_key)
    except Exception as e:
        return str(e)
    
@app.route('/get_pizza_data')
def get_pizza_data():
    try:
        with open('templates/data/pizza.json', 'r') as file:
            pizza_data = json.load(file)
        return jsonify(pizza_data)
    except Exception as e:
        return str(e)
    
    
@app.route('/update_total_price', methods=['POST'])
def update_total_price():
    try:
        # Ambil data total harga dan menu pesanan dari request
        order_data = request.get_json()

        # Baca data yang sudah ada (jika ada)
        database_file = 'templates/data/database.json'
        if os.path.exists(database_file):
            with open(database_file, 'r') as file:
                existing_data = json.load(file)
        else:
            # Jika file belum ada, inisialisasi data kosong
            existing_data = {}

        # Simpan data total harga dan menu pesanan ke dalam dictionary
        existing_data['totalHarga'] = order_data['totalHarga']
        existing_data['menus'] = order_data['menus']

        # Tulis kembali seluruh data ke dalam file
        with open(database_file, 'w') as file:
            json.dump(existing_data, file)

        # Respon sukses
        return jsonify({"status": "success", "message": "Data berhasil diperbarui"})
    except Exception as e:
        # Respon error
        return jsonify({"status": "error", "message": str(e)})


@app.route('/update_total_quantity', methods=['POST'])
def update_total_quantity():
    try:
        # Ambil data total jumlah pesanan dari request
        total_quantity_data = request.get_json()

        # Simpan data total jumlah pesanan ke dalam file database.json
        with open('templates/data/database.json', 'w') as file:
            json.dump(total_quantity_data, file)

        # Respon sukses
        return jsonify({"status": "success", "message": "Total jumlah pesanan berhasil diperbarui"})
    except Exception as e:
        # Respon error
        return jsonify({"status": "error", "message": str(e)})

    
@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        # Ambil data pembayaran dari request
        pembayaran_data = request.get_json()
        # Simpan data pembayaran ke dalam file order_data.json
        save_order_data(pembayaran_data["total"], pembayaran_data["quantity"], pembayaran_data["menus"])
        
        # Kembalikan respon sukses dengan pesan JSON
        response = jsonify({"status": "success", "message": "Pembayaran berhasil dilakukan"})
        
        # Atur header untuk mengizinkan akses dari halaman awal (index.html)
        response.headers.add('Access-Control-Allow-Origin', '*')
        
        return response
    except Exception as e:
        # Respon error
        return jsonify({"status": "error", "message": str(e)})


if __name__ == '__main__':
    app.run(debug=True,port=5000,host='0.0.0.0')
