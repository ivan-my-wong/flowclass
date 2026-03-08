export const appointmentTimeNote = `\n---
**availableTimeWs:** in weekly hours: Must convert to UTC time before submit
\nExample: the data in local time GMT+8
\`\`\`
{
  "start": {
    \t"weekDay": "MON",
    \t"time": "07:20"
  },
  "end": {
    \t"weekDay": "MON",
    \t"time": "10:30"
  }
}
\`\`\`
\nwhen change to UTC will become
\`\`\`
{
  "start": {
    \t"weekDay": "SUN",
    \t"time": "23:20"
  },
  "end": {
    \t"weekDay": "MON",
    \t"time": "02:30"
  }
}
\`\`\`
\n---
\n **For dateOverrides:**
\nall date and time **MUST** convert from local time zone to UTC time zone before submit
\nexcept for single day off.
\nto determine a day-off, set \`type = day_off\`,
\nleft \`end = null\`
\nset start to \`YYYY-MM-DDT00:00:00.000+08:00 (the date is in local time zone GMT+8)\`
\nto set a period of days-off, set \`type = period_off\`, for example: we off in the whole June 2023, with zone GMT+8
\nset start to \`2023-05-31T16:00:00.000Z (the date is in UTC time zone)\`
\nset end to \`2023-06-30T15:59:59.999Z (the date is in UTC time zone)\`
\nfor regular schedule change, set \`type = schedule_change\` 
and specify new time-slot for that lesson with start is lesson start time and end is lesson end time 
\n-\ndate range \`yyyy-MM-dd - yyyy-MM-dd\` must be spread out to many dates in that range
\n\`ex: 2023-03-15 - 2023-03-17\`
\nwill becomes \`['2023-03-15', '2023-03-16', '2023-03-17']\`
\nwhich mean an array of DateOverride objects
\nthen each of them will combine with its own time range \` hh:mm-hh:mm \`
\n\nfor many time range in a date
\nit must be spread out to many DateOverride objects
\nex: on date: \`2023-03-17\` have two time range \`['09:00-11:00', '15:00-17:00']\`
\nwill be come:\n
\`\`\`
[{
  "start": "2023-03-17T09:00:00.000Z",
  "end": "2023-03-17T11:00:00.000Z"
},
{
  "start": "2023-03-17T15:00:00.000Z",
  "end": "2023-03-17T17:00:00.000Z"
}]
\`\`\`
\nFor off day: no need to shift timezone before submit (off day will be local day)
\n---
\n __For tuition:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
\nexample: tuition = 2000 means $20`
