const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

app.get("/economy", async function (req, res) {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto("https://tradingeconomics.com/");
  await page.click("#ctl00_ContentPlaceHolder1_ctl04_LinkButton1");
  await page.waitFor(1000);

  const extractedEconomicData = await page.evaluate(() => {
    const [, ...economicData] = [
      ...document.getElementById("ctl00_ContentPlaceHolder1_ctl04_GridView1")
        .childNodes[1]["children"],
    ].map((x) => [...x.cells].map((p) => p.textContent.replace(/\s/g, "")));
    return economicData;
  });

  const economicDataParsed = extractedEconomicData.map(
    ([
      country,
      gdp,
      gdpYoy,
      gdpQoq,
      interestRate,
      inflationRate,
      joblessRate,
      govBudget,
      debtGDP,
      currentAccount,
      population,
    ]) => ({
      country,
      gdp,
      gdpYoy,
      gdpQoq,
      interestRate,
      inflationRate,
      joblessRate,
      govBudget,
      debtGDP,
      currentAccount,
      population,
    })
  );

  await browser.close();

  await res.send(economicDataParsed);
});

const port = process.env.PORT || 3051;
app.listen(port, function () {
  const exec = require('child_process').exec;
  exec('sh install_required_packages.sh');
});
