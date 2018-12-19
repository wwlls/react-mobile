import React, { Component } from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import { Toast } from 'antd-mobile';
import { Provider } from 'react-redux';
import promise from 'redux-promise'; //可以实行异步
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import FastClick from 'fastclick';
import qs from 'qs';
import RouterMap from './router';
import reducers from './reducers/index';
import Config from '../config';
import './static/css/base.css'

//移动设备上的浏览器默认会在用户点击屏幕大约延迟300毫秒后才会触发点击事件，这是为了检查用户是否在做双击。为了能够立即响应用户的点击事件，才有了FastClick
FastClick.attach(document.body);

// mock是本地模拟环境，Dev是本地开发环境
if (!Config.mock) {
    axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
}
axios.interceptors.request.use((axiosConfig) => {
    if (!Config.mock) {
        if (axiosConfig.method === 'get') {
            axiosConfig.data = qs.stringify(axiosConfig.data);
        }
    } else {
        if (axiosConfig.method === 'post') {
            axiosConfig.data = qs.stringify(axiosConfig.data);
        }
    }
    return axiosConfig;
}, (error) => {
    Toast.info('参数格式错误', 1);
    return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
    // 如果是模拟数据，直接返回data
    if (Config.mock) {
        return response.data;
    }
    //如果接口返回error_no不为0，就需要错误提示
    if (response.data.error_no && parseInt(response.data.error_no, 10) !== 0) {
        Toast.info(response.data.error_info, 2);
        return new Promise(() => {});
    }
    return response.data;
}, (error) => {
    Toast.info('参数格式错误', 1);
    return Promise.reject(error);
});

const createStoreWithMiddleware = applyMiddleware(promise, thunkMiddleware)(createStore);
ReactDom.render(
    <Provider store={createStoreWithMiddleware(reducers)}>
        <RouterMap />
    </Provider>,
    document.getElementById('root')
);
