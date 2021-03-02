import './Map.css';
import React, {useEffect, useState} from "react";
import {ready as readyYandex, init, distance} from './api';


export default props => {
    const {mapId, address} = props;
    const [data, setData] = useState(address);

    // вызывается после щелчка на карте
    const onLocation = (err, addr) => {
        if (err)
            return 'Ошибка !!!'
        // коодлинаты и адрес
        setData(addr);
    }

    const onSave = () => {
        const storeCoords = [56.34, 44]; // кординаты склада, для расчета растояний. (Н.Новгород)
        readyYandex // ждем готовности скрипта yandex map
            .then(() => distance(storeCoords, data.coords)) // считает растояние по дорогам
            .then(d => {
                alert(`Растояние по дорогам\nот Н.Новгорода\nдо ${data.text}\n${JSON.stringify(d, null, 4)}`);
            })
    }

    useEffect(() => {
        readyYandex // ждем готовности скрипта yandex map
            .then(() => init('mapId', {onLocation, address}))
    }, []);

    return (
        <div className="map">
            <div id={mapId} className="map-content"/>
            <div className="map-button">
                <input type="text" value={data ? data.text : ''} style={{width: '90%'}}/>
                <span> </span>
                <button disabled={!data} onClick={onSave}>Save</button>
            </div>
        </div>
    )
};