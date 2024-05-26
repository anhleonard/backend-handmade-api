import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as qs from 'qs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProductEntity } from 'src/order_products/entities/order-products.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(OrderProductEntity)
    private readonly opRepository: Repository<OrderProductEntity>,
  ) {}
  async payment(createPaymentDto: CreatePaymentDto, user: UserEntity) {
    const { totalPayment, currentUser } = await this.filteredOrder(
      createPaymentDto,
      user,
    );

    // APP INFO
    const config = {
      app_id: '2554',
      key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
      key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
      endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    };

    const embed_data = {
      redirecturl:
        'https://7288-2405-4802-1c94-8160-94b-b4ae-c0e9-43e3.ngrok-free.app/complete-order',
    };

    const items = [{}]; // add items to order
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: currentUser.name, // change user name
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: totalPayment, // change total payment
      description: `Handmade - Payment for the order #${transID}`,
      bank_code: '',
      mac: '',
      // callback_url:
      //   'https://aad5-118-70-129-28.ngrok-free.app/payment/callback',
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
      throw new BadRequestException(error.message);
    }
  }

  //lọc thông tin của order
  async filteredOrder(
    createPaymentDto: CreatePaymentDto,
    currentUser: UserEntity,
  ) {
    let orderProducts = [];
    let provisionalAmount = 0;
    let discountAmount = 0;
    let totalPayment = 0;

    for (let id of createPaymentDto.orderedProductIds) {
      const orderProduct = await this.opRepository.findOne({
        where: {
          id,
          isSelected: true,
          client: {
            id: currentUser.id,
          },
        },
        relations: {
          client: true,
          product: {
            store: true,
          },
          variant: true,
        },
      });

      if (!orderProduct) {
        break;
      }

      //tạm tính tiền
      provisionalAmount +=
        orderProduct.productUnitPrice * orderProduct.productQuantity;

      orderProducts.push(orderProduct);
    }

    //tính tổng tiền sau giảm + phí giao hàng
    totalPayment =
      provisionalAmount - discountAmount + createPaymentDto?.deliveryFee;

    if (orderProducts.length === 0) {
      throw new BadRequestException('No item can be sold.');
    }

    return {
      totalPayment,
      currentUser,
    };
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
    return result;
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

  async refund() {
    // APP INFO
    const config = {
      appid: '2554',
      key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
      key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
      refund_url: 'https://sb-openapi.zalopay.vn/v2/refund',
    };

    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

    let params = {
      app_id: config.appid,
      m_refund_id: `${moment().format('YYMMDD')}_${config.appid}_${uid}`,
      timestamp, // miliseconds
      zp_trans_id: '240527000000206',
      amount: '50000',
      description: 'ZaloPay Refund Demo',
      mac: '',
    };

    // app_id|zp_trans_id|amount|description|timestamp
    let data =
      params.app_id +
      '|' +
      params.zp_trans_id +
      '|' +
      params.amount +
      '|' +
      params.description +
      '|' +
      params.timestamp;
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
      const res = await axios.post(config.refund_url, null, { params });
      if (res) {
        return res.data;
      }
    } catch (error) {
      return error.message;
    }
  }
}
