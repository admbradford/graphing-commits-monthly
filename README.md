# Graphing Commits Monthly

## Install
```
npm i
```

## Generating Data

Run In the github repo you want to to get data for, replacing `DIRECTORY_NAME` with the dir you want to target
and update `FILE_NAME` to the name of the file you want output in csv format
```
git log --date=short --pretty="format:%ad" -- DIRECTORY_NAME | awk '{count[$1]++} END {for(date in count) print date "," count[date]}' > FILE_NAME.csv
```

## Generating Images
Inside this project run, replacing `FILE_NAME` with the cvs you generated in the first step & `TITLE` 
to the title you want in the image label. It defaults to `Project`

```
node commits_monthly.mjs FILE_NAME TITLE
```

The file output with be `commits_monthly_chart_TITLE.png` where title is the arg you passed, lowercased & trimmed, or `project` by default