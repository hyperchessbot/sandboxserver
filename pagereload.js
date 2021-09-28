import config from "/sandbox/config.js";

export default {
  reloadScript: `
<script>
const serverStamp = ${config.startStamp}
setInterval(_ => {
  fetch("${config.BASE_URL}stamp").then(response => response.text().then(content => {
    const [label, stamp] = content.split(" ")
    if(label != "stamp"){
      console.log("invalid label")
      return
    }
    if(parseInt(stamp) != serverStamp) {
      console.log("server changed, reloading")      
      document.getElementById("info").innerHTML="Server changed. Reloading ..."
      setTimeout(_ => document.location.reload(), 1000)
    }
  }))
},1000)
</script>
`
};
