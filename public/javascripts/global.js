// global.js


function initialize(user){
  // var html = '';
  // html += "<div class='main_menu'>";
  // html += "  <ul>";
  // html += "    <li><a href='/'>VAMPS Home</a></li>";
  // html += "    <li><a href='/helloworld'>Hello! Page</a></li>";
  // html += "    <li><a href='/visuals'>Community Visualization</a></li>";
  // html += "    <li><a href='/projects'>Project List</a></li>";
  // html += "    <li><a href='/users'>User List</a></li>";
  // html += "    <li><a href='/users/profile'>User Account</a></li>";
  // html += "    <li><a href='#'>Upload Data</a></li>";
  // html += "    <li><a href='#'>Export Data</a></li>";
  // html += "    <li><a href='#'>Search</a></li>";
  // html += "    <li><a href='#'>Distribution</a></li>";
  // html += "   <li><a href='#'>Metadata</a></li>";
  // html += "    <li><a href='#'>Portals</a></li>";
  // html += "  </ul>";
  // html += "</div>";
  // document.getElementById('main_menu').innerHTML = html;

  // login report
  html = '';
   if (user === 'undefined') {
    html += "(not logged in)";
    html += " (<a href='/users/login'  class='btn btn-default'><span class='fa fa-user'></span>login</a> or";
    html += "<a href='/users/signup' class='btn btn-default'><span class='fa fa-user'></span> register</a>)";
  } else {
    user = JSON.parse(user);
    html += "(Logged in as: "+user.username+")";
    if (user.security_level === 1) {
      html += "(admin)";
    }
    html += "<a href='/users/logout' class='btn btn-default btn-sm'> logout</a>";
  }
  document.getElementById('login_link').innerHTML = html;

}



