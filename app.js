"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.get('/nearby-schedules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lat = req.query.lat;
    const lng = req.query.lng;
    const count = req.query.count;
    const distance = req.query.distance;
    if (!lat || !lng || !count || !distance) {
        return res.status(500).json("These parameters are required: lat, lng, count, distance");
    }
    const url = `https://api.navitia.io/v1/coverage/${lng}%3b${lat}/coord/${lng}%3B${lat}/stop_schedules?items_per_schedule=2&data_freshness=realtime&count=${count}&distance=${distance}&`;
    const config = {
        headers: {
            'Authorization': process.env.NAVITIA_API_TOKEN
        }
    };
    try {
        const fetch = yield axios_1.default.get(url, config);
        const parsedSchedules = scheduleParse(fetch.data.stop_schedules);
        res.json(parsedSchedules);
    }
    catch (e) {
        console.error(e);
        res.status(500).json(`Error fetching and parsing navitia data:
        ${e}`);
    }
}));
function scheduleParse(data) {
    const transportList = [];
    data.map((stop) => {
        const { date_times, stop_point, display_informations } = stop;
        if (date_times.length > 0) {
            const transportObject = {
                code: display_informations.code,
                type: display_informations.network == "RER" ? "RER" : display_informations.commercial_mode,
                color: display_informations.color,
                text_color: display_informations.text_color,
                stop_name: stop_point.name,
                direction: display_informations.direction,
                next: date_times[0].date_time,
                after: date_times[1].date_time,
                next_freshness: date_times[0].data_freshness,
                after_freshness: date_times[1].data_freshness,
            };
            transportList.push(transportObject);
        }
    });
    return transportList;
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
