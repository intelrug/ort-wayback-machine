import axios from 'axios';

const transformRequest = [(data: {[key: string]: string}) => {
  const form = new FormData();
  Object.keys(data || {}).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      form.append(key, data[key]);
    }
  });
  return form;
}];
const http = axios.create({ baseURL: '/api/v1/', transformRequest });

export default class API {
  static getRecords() {
    return http.get('/records')
      .catch(console.log);
  }

  static getMessages(options: {reverse: boolean, time: number}) {
    return http.get('/messages', { params: options })
      .catch(console.log);
  }

  static getTracks(options: {before: number}) {
    return http.get('https://andreymal.org/cgi-bin/radio_now.py', { params: { history: 'ORT', ...options } })
      .catch(console.log);
  }
}
