import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxiosAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';  // Import the date adapter
import './Stats.css';  // Import the CSS file
import ChartDataLabels from 'chartjs-plugin-datalabels';  // Import the plugin
import { Chart } from 'chart.js';  // Import Chart.js

// Register the plugin
Chart.register(ChartDataLabels);

const apiUrl = process.env.REACT_APP_API_URL;

const StatsComponent = () => {
  const axios = useAxios();
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [bucketSize, setBucketSize] = useState('1d');
  const [orderTypeStats, setOrderTypeStats] = useState([]);
  const [paymentMethodStats, setPaymentMethodStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [displayQuantity, setDisplayQuantity] = useState(false);  // State for toggle

  useEffect(() => {
    fetchStats();
  }, [dateStart, dateEnd, bucketSize]);

  const fetchStats = () => {
    const params = {};
    if (dateStart) params.date_start = dateStart.toISOString();
    if (dateEnd) params.date_end = dateEnd.toISOString();
    if (bucketSize) params.bucket_size = bucketSize;

    axios.get(`${apiUrl}/stats`, { params })
      .then(response => {
        setOrderTypeStats(response.data.ordertype || []);
        setPaymentMethodStats(response.data.paymentmethod || []);
      })
      .catch(error => console.error(error));

    axios.get(`${apiUrl}/stats/by-product`, { params })
      .then(response => {
        setProductStats(response.data.product || []);
      })
      .catch(error => console.error(error));
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleClear = () => {
    setDateStart(null);
    setDateEnd(null);
  };

  const formatBucketLabel = (bucket) => {
    return bucket ? bucket.split('+')[0].replace('T', ' ') : '';
  };

  const generateColors = (length) => {
    const colors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];
    return colors.slice(0, length);
  };

  const orderTypeData = {
    labels: [...new Set(orderTypeStats.map(stat => formatBucketLabel(stat.bucket)))].sort(),
    datasets: orderTypeStats.reduce((acc, stat, index) => {
      const dataset = acc.find(d => d.label === stat.ordertype);
      if (dataset) {
        dataset.data.push({ x: formatBucketLabel(stat.bucket), y: stat.total_revenue });
      } else {
        acc.push({
          label: stat.ordertype,
          data: [{ x: formatBucketLabel(stat.bucket), y: stat.total_revenue }],
          backgroundColor: generateColors(orderTypeStats.length)[index],
        });
      }
      return acc;
    }, [])
  };

  const paymentMethodData = {
    labels: [...new Set(paymentMethodStats.map(stat => formatBucketLabel(stat.bucket)))].sort(),
    datasets: paymentMethodStats.reduce((acc, stat, index) => {
      const dataset = acc.find(d => d.label === stat.paymentmethod);
      if (dataset) {
        dataset.data.push({ x: formatBucketLabel(stat.bucket), y: stat.total_revenue });
      } else {
        acc.push({
          label: stat.paymentmethod,
          data: [{ x: formatBucketLabel(stat.bucket), y: stat.total_revenue }],
          backgroundColor: generateColors(paymentMethodStats.length)[index],
        });
      }
      return acc;
    }, [])
  };

  const productData = {
    labels: productStats.map(stat => stat.productname),
    datasets: [{
      label: displayQuantity ? 'Total Quantity by Product' : 'Total Revenue by Product',
      data: displayQuantity ? productStats.map(stat => stat.total_quantity) : productStats.map(stat => stat.total_revenue),
      backgroundColor: generateColors(productStats.length),
    }]
  };

  return (
    <div>
      <div className="controls-container">
        <div className="toggle-container">
          <span className="toggle-label">Revenue</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={displayQuantity}
              onChange={() => setDisplayQuantity(!displayQuantity)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">Quantity</span>
        </div>
        <div className="date-picker-container">
          <DatePicker
            selected={dateStart}
            onChange={date => setDateStart(date)}
            selectsStart
            startDate={dateStart}
            endDate={dateEnd}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select start date and time"
          />
          <DatePicker
            selected={dateEnd}
            onChange={date => setDateEnd(date)}
            selectsEnd
            startDate={dateStart}
            endDate={dateEnd}
            minDate={dateStart}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select end date and time"
          />
          <select className="bucket-size-selector" value={bucketSize} onChange={e => setBucketSize(e.target.value)}>
            <option value="1d">1 Day</option>
            <option value="1h">1 Hour</option>
          </select>
          <button className="clear-button" onClick={handleClear}>Clear</button>
          <button className="refresh-button" onClick={handleRefresh}>Refresh</button>
        </div>
      </div>
      <div className="chart-container">
        <div className="chart">
          <Bar
            data={orderTypeData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  display: true,
                  color: 'black',
                  formatter: (value) => `$${Number(value.y).toFixed(0)}`,
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: bucketSize === '1d' ? 'day' : 'hour',
                  },
                  ticks: {
                    callback: function(value, index, values) {
                      const date = new Date(value);
                      if (date.getHours() === 0) {
                        return date.toLocaleDateString();
                      }
                      return date.toLocaleTimeString();
                    }
                  }
                },
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        <div className="chart">
          <Bar
            data={paymentMethodData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  display: true,
                  color: 'black',
                  formatter: (value) => `$${Number(value.y).toFixed(0)}`,
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: bucketSize === '1d' ? 'day' : 'hour',
                  },
                  ticks: {
                    callback: function(value, index, values) {
                      const date = new Date(value);
                      if (date.getHours() === 0) {
                        return date.toLocaleDateString();
                      }
                      return date.toLocaleTimeString();
                    }
                  }
                },
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        <div className="chart">
          <Bar
            data={productData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  display: true,
                  color: 'black',
                  formatter: (value) => displayQuantity ? `${Number(value).toFixed(0)}` : `$${Number(value).toFixed(0)}`,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;