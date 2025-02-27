// commits_monthly.mjs
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import moment from 'moment';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

// Grab CSV filename from command-line arguments
// Example usage: `node commits_monthly.mjs my_commits.csv`
const [,, csvFilename, directoryName] = process.argv;
const labelName = directoryName || 'Project';
// Check if a CSV filename was provided
if (!csvFilename) {
  console.error('Usage: node commits_monthly.mjs <csv-file>');
  process.exit(1);
}

// Check if the file exists
if (!fs.existsSync(csvFilename)) {
  console.error(`File not found: ${csvFilename}`);
  process.exit(1);
}

// Read CSV data
const rows = [];
fs.createReadStream(path.resolve(csvFilename))
  .pipe(csvParser({ headers: ['date', 'commits'] }))
  .on('data', (data) => {
    rows.push(data);
  })
  .on('end', async () => {
    // Convert date strings to Moment objects and commits to integers
    rows.forEach((row) => {
      // Adjust parsing format (e.g. 'YYYY-MM-DD') if your CSV differs
      row.date = moment(row.date, 'YYYY-MM-DD');
      row.commits = parseInt(row.commits, 10) || 0;
    });

    // Sort by date
    rows.sort((a, b) => a.date - b.date);

    // Group commits by 'YYYY-MM'
    const monthlyCommits = {};
    rows.forEach(({ date, commits }) => {
      const monthKey = date.format('YYYY-MM');
      monthlyCommits[monthKey] = (monthlyCommits[monthKey] || 0) + commits;
    });

    // Prepare arrays for Chart.js
    const months = Object.keys(monthlyCommits).sort();
    const commitData = months.map((m) => monthlyCommits[m]);

    // Setup chart configuration
    const width = 1000;  // px
    const height = 600;  // px
    const backgroundColour = 'white';

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width, 
      height, 
      backgroundColour 
    });

    const config = {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: `Number of Commits (Monthly) - ${labelName}`,
          data: commitData,
          backgroundColor: 'rgba(0, 0, 0, 1)',
        }],
      },
    };

    // Render chart to a buffer
    try {
      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
      const outputFile = `commits_monthly_chart_${labelName.toLowerCase().trim()}.png`;
      fs.writeFileSync(outputFile, imageBuffer);
      console.log(`Chart saved as ${outputFile}`);
    } catch (error) {
      console.error('Error generating chart:', error);
    }
  });
