exports.toIsoWithOffset = date => {
  if (!date) return undefined;
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  
  const sign = '+';
  const offsetHour = '00';
  const offsetMin = '00';

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${offsetHour}:${offsetMin}`;
}
