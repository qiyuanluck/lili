import { createStore } from 'vuex'
import axios from 'axios';
import router from '../router'
import { ElMessage } from 'element-plus';

export default createStore({
    state: {
        // 是否加载中
        isLoading: false,
        // 是否登录
        isLogin: false,
        // 当前用户
        user: {},
        // 分区列表
        channels: [],
    },
    mutations: {
        // 更新登录状态
        updateIsLogin(state, isLogin) {
            state.isLogin = isLogin;
        },
        // 更新当前用户
        updateUser(state, user) {
            state.user = user;
            // console.log("更新vuex中用户信息: ", state.user);
        },
        // 更新分区列表
        updateChannels(state, channels) {
            state.channels = channels;
            // console.log("vuex中的分区: ", state.channels);
        },
    },
    actions: {
        // 获取当前用户信息
        async getPersonalInfo(context) {
            // 这里为了更方便捕捉到错误后做出反应，就不使用封装的函数了
            const result = await axios.get("/api/admin/personal/info", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("teri_token"),
                },
            })
            .catch(() => {
                // 一般这里捕抓到异常就表示token失效了，所以直接清空浏览器缓存就好了，不需要调用退出函数了
                // 修改当前的登录状态
                context.state.isLogin = false;
                // 清空user信息
                context.state.user = {};
                // 清除本地token缓存
                localStorage.removeItem("teri_token");
                ElMessage.error("请登录后查看");
                router.push("/login");
            });
            if (!result) return;
            if (result.data.code !== 200) {
                // 不是返回200码的都是认证失败，要清除缓存
                // 修改当前的登录状态
                context.state.isLogin = false;
                // 清空user信息
                context.state.user = {};
                // 清除本地token缓存
                localStorage.removeItem("teri_token");
                ElMessage.error(result.data.message);
                router.push("/login");
            }
            if (result.data.code === 200) {
                context.commit("updateUser", result.data.data);
                context.state.isLogin = true;
            }
        },
        
        // 退出登录
        logout(context) {
            // 先修改状态再发送请求，防止token过期导致退出失败
            // 修改当前的登录状态
            context.state.isLogin = false;
            // 清空user信息
            context.state.user = {};
            router.push("/login");
            // 发送退出请求，处理redis中的缓存信息，不能用异步，不然token过期导致退出失败，后面步骤卡死
            axios.get("/api/admin/account/logout", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("teri_token"),
                },
            });
            // 清除本地token缓存
            localStorage.removeItem("teri_token");
        }
    }
})