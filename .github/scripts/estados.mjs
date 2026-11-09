// Tablas copiadas de game/MictLAN.html para publicar solo el estado de cada jugador.
// Si cambias estas reglas en el juego, actualiza también este archivo.
  var CITIES = [
    ['Mérida', 0, -89.62, 20.97], ['Ciudad de México', 0, -99.13, 19.43], ['Guadalajara', 0, -103.35, 20.67], ['Monterrey', 0, -100.31, 25.67],
    ['Puebla', 0, -98.2, 19.04], ['Cancún', 0, -86.85, 21.16], ['Tijuana', 0, -117.03, 32.51], ['Querétaro', 0, -100.39, 20.59],
    ['Veracruz', 0, -96.13, 19.17], ['Chihuahua', 0, -106.07, 28.63], ['Oaxaca', 0, -96.73, 17.06], ['Hermosillo', 0, -110.97, 29.07],
    ['Villahermosa', 0, -92.93, 17.99], ['La Paz', 0, -110.31, 24.14],
    ['León', 0, -101.68, 21.12], ['San Luis Potosí', 0, -100.98, 22.15], ['Toluca', 0, -99.66, 19.29], ['Aguascalientes', 0, -102.29, 21.88],
    ['Morelia', 0, -101.19, 19.70], ['Saltillo', 0, -101.0, 25.42], ['Culiacán', 0, -107.39, 24.81], ['Mexicali', 0, -115.47, 32.66],
    ['Acapulco', 0, -99.89, 16.85], ['Cuernavaca', 0, -99.23, 18.92], ['Tampico', 0, -97.86, 22.23], ['Torreón', 0, -103.43, 25.54],
    ['Durango', 0, -104.67, 24.02], ['Zacatecas', 0, -102.57, 22.77], ['Tuxtla Gutiérrez', 0, -93.12, 16.75], ['Campeche', 0, -90.53, 19.85],
    ['Chetumal', 0, -88.30, 18.50], ['Playa del Carmen', 0, -87.07, 20.63], ['Tepic', 0, -104.89, 21.51], ['Colima', 0, -103.72, 19.24],
    ['Pachuca', 0, -98.76, 20.12], ['Tlaxcala', 0, -98.24, 19.32], ['Xalapa', 0, -96.92, 19.54], ['Reynosa', 0, -98.28, 26.08],
    ['Ciudad Juárez', 0, -106.49, 31.69], ['Mazatlán', 0, -106.41, 23.24], ['Ensenada', 0, -116.60, 31.87], ['Los Cabos', 0, -109.91, 22.89],
    ['Puerto Vallarta', 0, -105.23, 20.65], ['Tapachula', 0, -92.26, 14.91], ['Ciudad Obregón', 0, -109.94, 27.49], ['Nuevo Laredo', 0, -99.51, 27.48],
    ['Matamoros', 0, -97.50, 25.87], ['Celaya', 0, -100.81, 20.52], ['Irapuato', 0, -101.35, 20.68], ['Guanajuato', 0, -101.26, 21.02],
    ['Ciudad del Carmen', 0, -91.83, 18.65], ['Progreso', 0, -89.66, 21.28], ['Valladolid', 0, -88.20, 20.69], ['Tulum', 0, -87.46, 20.21]
  ];
  var ALIASES = { 'cdmx': 'Ciudad de México', 'df': 'Ciudad de México', 'mexico city': 'Ciudad de México', 'distrito federal': 'Ciudad de México',
    'cd mexico': 'Ciudad de México', 'cd juarez': 'Ciudad Juárez', 'juarez': 'Ciudad Juárez', 'gdl': 'Guadalajara', 'mty': 'Monterrey',
    'cd obregon': 'Ciudad Obregón', 'tuxtla': 'Tuxtla Gutiérrez', 'cabo san lucas': 'Los Cabos', 'san jose del cabo': 'Los Cabos',
    'merida': 'Mérida', 'yucatan': 'Mérida', 'cancun': 'Cancún' };
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  var CITY_KEYS = [];
  CITIES.forEach(function (c) { CITY_KEYS.push([norm(c[0]), c[0]]); });
  Object.keys(ALIASES).forEach(function (k) { CITY_KEYS.push([k, ALIASES[k]]); });
  CITY_KEYS.sort(function (a, b) { return b[0].length - a[0].length; });
  function matchCity(text) {
    var t = ' ' + norm(text) + ' ';
    for (var i = 0; i < CITY_KEYS.length; i++) { if (t.indexOf(' ' + CITY_KEYS[i][0] + ' ') > -1) return CITY_KEYS[i][1]; }
    return null;
  }
  function num(v) { v = Number(v); return isFinite(v) && v > 0 ? Math.round(v) : 0; }

  const CIUDAD_ESTADO = {
    'ciudad de méxico':'Ciudad de México','cdmx':'Ciudad de México',
    'guadalajara':'Jalisco','zapopan':'Jalisco','tlaquepaque':'Jalisco',
    'monterrey':'Nuevo León','san nicolás':'Nuevo León','apodaca':'Nuevo León','escobedo':'Nuevo León',
    'puebla':'Puebla','cholula':'Puebla',
    'tijuana':'Baja California','mexicali':'Baja California','ensenada':'Baja California',
    'toluca':'Estado de México','ecatepec':'Estado de México','naucalpan':'Estado de México','nezahualcóyotl':'Estado de México',
    'león':'Guanajuato','guanajuato':'Guanajuato','irapuato':'Guanajuato',
    'chihuahua':'Chihuahua','juárez':'Chihuahua','ciudad juárez':'Chihuahua',
    'mérida':'Yucatán','valladolid':'Yucatán',
    'hermosillo':'Sonora','nogales':'Sonora','obregón':'Sonora',
    'culiacán':'Sinaloa','mazatlán':'Sinaloa','los mochis':'Sinaloa',
    'acapulco':'Guerrero','chilpancingo':'Guerrero',
    'cancún':'Quintana Roo','playa del carmen':'Quintana Roo','tulum':'Quintana Roo','chetumal':'Quintana Roo',
    'veracruz':'Veracruz','xalapa':'Veracruz','coatzacoalcos':'Veracruz',
    'oaxaca':'Oaxaca','salina cruz':'Oaxaca',
    'morelia':'Michoacán','uruapan':'Michoacán','zamora':'Michoacán',
    'aguascalientes':'Aguascalientes',
    'san luis potosí':'San Luis Potosí',
    'saltillo':'Coahuila','torreón':'Coahuila','monclova':'Coahuila',
    'durango':'Durango',
    'tepic':'Nayarit',
    'colima':'Colima','manzanillo':'Colima',
    'tuxtla gutiérrez':'Chiapas','san cristóbal':'Chiapas','tapachula':'Chiapas',
    'villahermosa':'Tabasco','cárdenas':'Tabasco',
    'campeche':'Campeche',
    'matehuala':'San Luis Potosí','ciudad valles':'San Luis Potosí',
    'zacatecas':'Zacatecas','fresnillo':'Zacatecas',
    'pachuca':'Hidalgo','tula':'Hidalgo',
    'querétaro':'Querétaro',
    'cuernavaca':'Morelos','jiutepec':'Morelos',
    'tlaxcala':'Tlaxcala','apizaco':'Tlaxcala',
    'chilpancingo':'Guerrero',
    'la paz':'Baja California Sur','los cabos':'Baja California Sur','cabo san lucas':'Baja California Sur',
    'cd. obregón':'Sonora','ciudad obregón':'Sonora',
    'tampico':'Tamaulipas','matamoros':'Tamaulipas','reynosa':'Tamaulipas','nuevo laredo':'Tamaulipas',
  };

  const ESTADO_COORDS = {
    'Aguascalientes':      [21.8853, -102.2916],
    'Baja California':     [30.8406, -115.2838],
    'Baja California Sur': [26.0444, -111.6661],
    'Campeche':            [19.8301, -90.5349],
    'Chiapas':             [16.7569, -93.1292],
    'Chihuahua':           [28.6353, -106.0889],
    'Ciudad de México':    [19.4326, -99.1332],
    'Coahuila':            [27.0587, -101.7068],
    'Colima':              [19.2452, -103.7241],
    'Durango':             [24.0277, -104.6532],
    'Estado de México':    [19.2826, -99.6557],
    'Guanajuato':          [21.0190, -101.2574],
    'Guerrero':            [17.4392, -100.0000],
    'Hidalgo':             [20.0911, -98.7624],
    'Jalisco':             [20.6597, -103.3496],
    'Michoacán':           [19.7008, -101.1844],
    'Morelos':             [18.6813, -99.1013],
    'Nayarit':             [21.7514, -104.8455],
    'Nuevo León':          [25.5922, -99.9962],
    'Oaxaca':              [17.0732, -96.7266],
    'Puebla':              [19.0414, -98.2063],
    'Querétaro':           [20.5888, -100.3899],
    'Quintana Roo':        [19.1817, -88.4791],
    'San Luis Potosí':     [22.1565, -100.9855],
    'Sinaloa':             [25.1721, -107.4795],
    'Sonora':              [29.0729, -110.9559],
    'Tabasco':             [17.8409, -92.6189],
    'Tamaulipas':          [24.2669, -98.8363],
    'Tlaxcala':            [19.3182, -98.2375],
    'Veracruz':            [19.1738, -96.1342],
    'Yucatán':             [20.9674, -89.5926],
    'Zacatecas':           [22.7709, -102.5832],
  };

  const quitarAcentos = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\./g, '').trim();

  const ESTADO_ALIAS = {};
  Object.keys(ESTADO_COORDS).forEach(k => { ESTADO_ALIAS[quitarAcentos(k)] = k; });
  Object.assign(ESTADO_ALIAS, {
    'mexico city': 'Ciudad de México', 'federal district': 'Ciudad de México', 'distrito federal': 'Ciudad de México',
    'cdmx': 'Ciudad de México', 'ciudad de mexico': 'Ciudad de México', 'cd de mexico': 'Ciudad de México', 'df': 'Ciudad de México',
    'state of mexico': 'Estado de México', 'estado de mexico': 'Estado de México', 'mexico state': 'Estado de México',
    'edomex': 'Estado de México', 'edo de mexico': 'Estado de México',
    'michoacan de ocampo': 'Michoacán', 'coahuila de zaragoza': 'Coahuila',
    'veracruz de ignacio de la llave': 'Veracruz', 'baja california norte': 'Baja California',
    'queretaro de arteaga': 'Querétaro',
  });
  const CIUDAD_ESTADO_N = {};
  Object.keys(CIUDAD_ESTADO).forEach(k => { CIUDAD_ESTADO_N[quitarAcentos(k)] = CIUDAD_ESTADO[k]; });

  const estadoCanonico = (t) => ESTADO_ALIAS[quitarAcentos(t)] || null;
  const esMexico = (c) => { const n = quitarAcentos(c); return n === 'mexico' || n === 'mx' || n === 'united mexican states'; };

  function extractEstado(city) {
    if (!city) return null;
    var parts = String(city).split(',').map(function (x) { return x.trim(); }).filter(Boolean), i, e;
    for (i = parts.length - 1; i >= 0; i--) { e = estadoCanonico(parts[i]); if (e) return e; }
    return CIUDAD_ESTADO_N[quitarAcentos(parts[0] || '')] || null;
  }
  var CITY2STATE = {'Mérida':'Yucatán','Ciudad de México':'Ciudad de México','Guadalajara':'Jalisco','Monterrey':'Nuevo León','Puebla':'Puebla','Cancún':'Quintana Roo','Tijuana':'Baja California','Querétaro':'Querétaro','Veracruz':'Veracruz','Chihuahua':'Chihuahua','Oaxaca':'Oaxaca','Hermosillo':'Sonora','Villahermosa':'Tabasco','La Paz':'Baja California Sur','León':'Guanajuato','San Luis Potosí':'San Luis Potosí','Toluca':'Estado de México','Aguascalientes':'Aguascalientes','Morelia':'Michoacán','Saltillo':'Coahuila','Culiacán':'Sinaloa','Mexicali':'Baja California','Acapulco':'Guerrero','Cuernavaca':'Morelos','Tampico':'Tamaulipas','Torreón':'Coahuila','Durango':'Durango','Zacatecas':'Zacatecas','Tuxtla Gutiérrez':'Chiapas','Campeche':'Campeche','Chetumal':'Quintana Roo','Playa del Carmen':'Quintana Roo','Tepic':'Nayarit','Colima':'Colima','Pachuca':'Hidalgo','Tlaxcala':'Tlaxcala','Xalapa':'Veracruz','Reynosa':'Tamaulipas','Ciudad Juárez':'Chihuahua','Mazatlán':'Sinaloa','Ensenada':'Baja California','Los Cabos':'Baja California Sur','Puerto Vallarta':'Jalisco','Tapachula':'Chiapas','Ciudad Obregón':'Sonora','Nuevo Laredo':'Tamaulipas','Matamoros':'Tamaulipas','Celaya':'Guanajuato','Irapuato':'Guanajuato','Guanajuato':'Guanajuato','Ciudad del Carmen':'Campeche','Progreso':'Yucatán','Valladolid':'Yucatán','Tulum':'Quintana Roo'};

// Devuelve el estado con la misma lógica que usa el mapa del juego.
export function estadoDe(ciudad, pais) {
  const p = norm(pais);
  if (p && p.indexOf('mex') === -1) return '';
  if (!ciudad) return '';
  let estado = extractEstado(ciudad);
  const lugar = matchCity(ciudad);
  if (!lugar && !estado) estado = 'Ciudad de México';
  if (lugar && !estado) estado = CITY2STATE[lugar] || null;
  if (!estado || !ESTADO_COORDS[estado]) estado = 'Ciudad de México';
  return estado;
}
