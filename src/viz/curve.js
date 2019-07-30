// https://stackoverflow.com/questions/29575151/d3-selectall-data-just-returns-data-in-first-element-why
const getData = () => {
    return d3.selectAll('svg').selectAll('.line').each(function(d) {
        // Within this function d is this group's data.
        // Iterate, accumulate, do whatever you like at this point.
    });
}