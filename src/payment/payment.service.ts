import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class PaymentService {
  async payment() {
    // APP INFO
    const config = {
      app_id: '2554',
      key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
      key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
      endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    };

    const embed_data = {
      redirecturl: 'https://www.google.com',
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: 'user123',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 50000,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: '',
      mac: '',
      callback_url:
        'https://aad5-118-70-129-28.ngrok-free.app/payment/callback',
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      config.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
      const res = await axios.post(config.endpoint, null, { params: order });
      if (res) {
        return res.data;
      }
    } catch (error) {
      return error.message;
    }
  }

  async callback(body: any) {
    // APP INFO
    const config = {
      appid: '2554',
      key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
      key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
      endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    };

    let result: any = {};

    try {
      let dataStr = body.data;
      let reqMac = body.mac;

      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log('mac =', mac);

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson['app_trans_id'],
        );

        result.return_code = 1;
        result.return_message = 'success';
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    console.log(result);
  }

  async checkOrderStatus(id: string) {
    // APP INFO
    const config = {
      appid: '2554',
      key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
      key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
      endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    };

    let postData = {
      app_id: config.appid,
      app_trans_id: id, // Input your app_trans_id
      mac: '',
    };

    let data =
      postData.app_id + '|' + postData.app_trans_id + '|' + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    };

    console.log(postConfig);

    try {
      const res = await axios(postConfig);
      if (res) {
        return res.data;
      }
    } catch (error) {
      return error.message;
    }
  }
}
