const {ymaps} = window;
let myMap = null;

export const ready = ymaps.ready(() => new Promise((res => res())));

export const createMap = (mapId, center) => {
    myMap = new ymaps.Map(mapId, {
        center,
        zoom: 8,
        controls: ['geolocationControl']
    });

    return myMap;
}

export const geocode = (coords) => {
    const [lat, lng] = coords;
    return ymaps.geocode(`${lat},${lng}`)
        .then((res) => {
            // результаты геокодирования объекта.
            return {...res.geoObjects.get(0).properties.getAll(), coords};
        })
};

export const distance = (start, end) => new Promise((res, rej) => {
    const route = new ymaps.multiRouter.MultiRoute({
        // Точки маршрута. Точки могут быть заданы как координатами, так и адресом.
        referencePoints: [start, end]
    }, {
        // Автоматически устанавливать границы карты так,
        // чтобы маршрут был виден целиком.
        //boundsAutoApply: true
    });
    route.model.events.add('requestsuccess', function () {
        // Получение ссылки на активный маршрут.
        const activeRoute = route.getActiveRoute();
        res({
            distance: activeRoute.properties.get("distance"),
            time: activeRoute.properties.get("duration")
        });
    });
    route.model.events.add('requesterror', err => rej(err));
})

const popup = (map, data) => {
    const {text, coords} = data;
    const [lat, lng] = coords;
    map.balloon.open(coords, {
        contentHeader: `Адрес<hr/>`,
        contentBody: `<p>${text}</p>
                         <sub>Координаты (Ш,Д): ${lat.toPrecision(6)},${lng.toPrecision(6)}</sub>`,
        //contentFooter: '<button>Сохранить</button>'
    });
}

const location = () => {
    const loc = ymaps.geolocation.get();

    // Асинхронная обработка ответа.
    return loc.then(result => result.geoObjects.position);
}

export const init = (mapId, options) => {
    const {onLocation, address} = options;
    const center = (address && address.coords) || [53, 44];
    const map = createMap(mapId, center);
    if (address) {
        popup(map, address);
    } else {
        location()
            .then(coords => map.setCenter(coords, 7));
    }

    map.events.add('click', (e) => {
        const coords = e.get('coords');
        geocode(coords)
            .then(data => {
                popup(map, data);
                onLocation && onLocation(null, data);
            })
            .catch(err => onLocation && onLocation(err));
    });
};


