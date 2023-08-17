import express, {Request, Response} from 'express';
import axios from "axios";

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/nearby-schedules', async (req: Request, res: Response) => {
    const lat = req.query.lat;
    const lng = req.query.lng;
    const count = req.query.count;
    const distance = req.query.distance;

    if(!lat || !lng || !count || !distance) {
        return res.status(500).json("These parameters are required: lat, lng, count, distance")
    }



    const url = `https://api.navitia.io/v1/coverage/${lng}%3b${lat}/coord/${lng}%3B${lat}/stop_schedules?items_per_schedule=2&data_freshness=realtime&count=${count}&distance=${distance}&`

    const config = {
        headers: {
            'Authorization': process.env.NAVITIA_API_TOKEN
        }
    }

    try {
    const fetch = await axios.get(url, config);
    const parsedSchedules = scheduleParse(fetch.data.stop_schedules);


    res.json(parsedSchedules);
    } catch (e: any) {
        console.error(e)
        res.status(500).json(`Error fetching and parsing navitia data:
        ${e}`)
    }
});

interface TransportObject {
    code: string,
    type: string,
    color: string,
    text_color: string,
    stop_name: string,
    direction: string,
    next: string,
    after: string,
    next_freshness: string,
    after_freshness: string,
}


function scheduleParse(data: any) {
    const transportList: any[] = [];

    data.map((stop: any) => {
        const {date_times, stop_point, display_informations} = stop
        if (date_times.length > 0) {
            const transportObject: TransportObject = {
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
    })


    return transportList
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});