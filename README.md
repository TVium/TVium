# TVium
TVium is to Connected TVs what Chromium/Wordpress are to Connected PCs and Android is to Connected Mobiles, a TV driven shared **framework** for the right product of TV and the Internet
* Unified by **TV streams**, as Connected PCs are unified by **sites** and Connected Mobile Phones are unified by **apps**
* Building on **HbbTV**, the best product of Web and Broadcast base standards
* Uncompromising on **personal data**, compliant by design with GDPR and local rules like CNIL's 
* Adjusting broadly by **broadcast native** pure players  
* Developing a **standardized** layer for common features
* Differentiable by each customizing its **TVia** by configuration and integration
* Siding on a **client** yet defining a common API to be served by each broadcaster
* Biasing more towards **frequency** vs **depth** when releasing
* Open to any **contribution** 
* Aiming for the easiest **support** by the main TV OEMs and operators and the easiest **service** by broadcasters

## TVium is broadcast driven connected TVs, neither like connected PCs nor like connected mobiles

| Device  | Purpose | Units                | Base Access  | Structure | Prime Discovery | Second discovery |    
| --------| ------- |----------------------|---------|---------|-----------------|------------|
| PC      | Business| Site/Page/Article    | Chromium | Portal  | Links           | Search     |
| Mobile  | Casual  | App/Feed/Card        | iOS or Android     | Home Apps    | Store           | Feed       |
| TV      | Event   | Stream/Program/Episode  | Prime stream | EPG    | Remote Zapping     | ?       |

## TVium is open source framework, neither like a pure spec nor like a complete product

| Product | For device OEMs | For channels broadcasters | For service providers | 
|---------|---------------------------|---------------------------------|--------------------|
| Spec    | Many units to test | Hard on (many) differences    | one shot custom dev |
| Complete | One unit to integrate | Just to use but risk of lockin | binary cost intensive competitions |
| TVium | One unit to support | Just to configure without lockin | continuous value added services |

## TVium is handling the boilerplate of any connected TV stream lifecycle
TVium is standardizing the basics needed to run a TV stream :
1. When the device is catching the URL broadcasted on the stream number or argued within a createApplication() call, a static whitelist.html is loaded
2. If whitelist.html checks in the user agent in the white list, it loads an indexN.html, saving the ressources for non compatible devices
3. The indexN.html is a TV stream boilerplate head up with references to the configurable stylesheets and the scripts that are bundled and minified when possible
4. The indexN.html declares an element for the live stream, a container for TVium visual features, a container for the streamer special features and the standard HbbTV object to use HbbTV APIs
5. On load, main.js runs to activate the configuration of features compliant with the User Agent
6. Each feature is the product of a feature.js that may be served through by a TVium defined API, react to an event from the stream or the user and display audiovisuals in its declared HTML container
7. When the user zap out the TV stream, the app is killed

## TVium can be used just by configuration
All the configuration is done in the config folder 
For a basic stream, the streamer MUST : 
1. Edit the logo of its publisher in the assets folder

The streamer MAY also : 
1. Style its stream by editing main.less
2. Choose the features to activate by editing features.js
3. Localize the labels in its language by editing 

## TVium can be customized by special features
To add a special feature, the streamer MUST :
1. Declare a STREAMER_NAME_FEATURE_NAME.js to indexN.html
2. Declare a <div> in its special div container with an id prefixed by STREAMER_NAME
3. Add a node for its feature in features.js to configure activation

## TVium Released Features
- [x] **Whitelising** per upfront static file
- [x] **Features Picking** per User Agent and per Cheat code
- [x] **Consent Management** compliant with GDPR, CNIL and data partnerships 
- [x] **Live Audience Measurement** per consenting user and in aggregate
- [x] **Linear Ads Measurement** per spot per quartile compliant with DVB-TA signals and main Digital Ad Servers
- [x] **ContextuaL Bridge** on stream period start or end

## TVium Developing Features
- [ ] **Linear Ads Switching** aka compliant with DVB-TA signals, guaranteed by HbbTV-TA Profile 2 and main Digital Ad Servers

## TVium backlog
- [ ] **Broadband Stream** for non broadcasted streams 
- [ ] **Visual Templates** for layout configuration
- [ ] **Upfront Pairing** for rich presence based usages
