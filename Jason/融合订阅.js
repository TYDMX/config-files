//https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main/Jason/融合订阅.js
function main(config) {
    const 图标库 = "https://github.com/Koolson/Qure/raw/master/IconSet/Color/";
    const 测速链接 = "https://cp.cloudflare.com/generate_204";
    const 测速间隔 = 300;
    const 测速超时 = 2000;
    const 测速容差 = 50;

    // ═══════════════════════════════════
    //   一、数据准备层
    // ═══════════════════════════════════
    // --- ① 合并外部订阅 ----------
    config["proxy-providers"] = {
        ...(config["proxy-providers"] || {}),
        "节点池vless 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?type=vless", interval: 3600 },
        "节点池vmess 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?type=vmess", interval: 3600 },
        "节点池trojan 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?type=trojan", interval: 3600 },
        "节点池hysteria2 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?type=hysteria2", interval: 3600 },
        "节点池anytls 🪩": { url: "https://proxypool.dmit.dpdns.org/clash/proxies?type=anytls", interval: 3600 },
    };
    const 外部订阅 = Object.keys(config["proxy-providers"] || {});
    const 节点黑名单 = "(阻止|China|🇨🇳|高倍|×10|10M|节点|过滤|剩余|流量|距离|下次|重置|重新|订阅|导入|套餐|到期|跳转|域名|请勿|邀请|好友|关注|频道|收费|就说明|被骗|续费|更新|地址|官网|下载|群组|永久|长期|中继|更换|协议|软件|教程|Lite|ali)";
    if (config["proxy-providers"]) {
        for (let 机场名 in config["proxy-providers"]) {
            let 原订阅 = config["proxy-providers"][机场名];
            if (原订阅.url) {
                const emojiMatch = 机场名.match(/[\u{1F300}-\u{1FBFF}\u{2600}-\u{27BF}]/u);
                const 自动前缀 = emojiMatch ? `${emojiMatch[0]} ` : "";
                config["proxy-providers"][机场名] = 
                    {...原订阅,
                    "type": "http",
                    "url": 原订阅.url,
                    "proxy": "DIRECT", 
                    "tfo": true,
                    "exclude-filter": `(?i)${节点黑名单}`,
                    "exclude-type": "http|ss",
                    "path": `./proxies/${机场名}.yaml`,
                    "override": {
                        "additional-prefix": 自动前缀
                    },
                    "health-check": {
                        "enable": true,
                        "url": 测速链接,
                        "interval": 测速间隔 * 1.73,
                        "timeout": 测速超时,
                        "max-failed-times": 3,
                        "lazy": true,
                        "method": "HEAD",
                    },
                };
            }
        }
    }
    // --- ② 合并内部节点 ----------
    const 功能节点 = [
        { name: "🎯 全球直连", type: "direct", udp: true },
        { name: "🈚️ 假节点", type: "reject" },
        { name: "🚫 阻止", type: "reject" },
        // { name: "↕️ 跳过规则", type: "PASS-RULE" },  // PASS-RULE 不能作为节点类型
        { name: '🇨🇳 直连(IPv4)', type: 'direct', udp: true, 'ip-version': 'ipv4' },
        { name: '🇨🇳 直连(IPv6)', type: 'direct', udp: true, 'ip-version': 'ipv6' },
        { name: '🇨🇳 直连(IPv4优先)', type: 'direct', udp: true, 'ip-version': 'ipv4-prefer' },
        { name: '🇨🇳 直连(IPv6优先)', type: 'direct', udp: true, 'ip-version': 'ipv6-prefer' },
    ];
    const 内部过滤节点 = (config["proxies"] || []).filter(
        p => !功能节点.some(e => e.name === p.name)
    );
    config["proxies"] = [
        ...内部过滤节点,
        ...功能节点
    ];
    const 内部节点 = config["proxies"].map(p => p.name);

    // ═══════════════════════════════════
    //   二、核心协议层
    // ═══════════════════════════════════
    // --- ① 全局基础配置 ----------
    config["log-level"] = "info";
    config["port"] = 7890;
    config["socks-port"] = 7891;
    config["mixed-port"] = 7893;
    config["tproxy-port"] = 7894;
    config["ipv6"] = true;
    config["allow-lan"] = false;
    config["unified-delay"] = true;
    config["tcp-concurrent"] = true;
    config["etag-support"] = true;
    config["external-controller"] = "127.0.0.1:9090";
    config["secret"] = "12345678";
    config["find-process-mode"] = "strict";
    config["profile"] = {
        "store-selected": true,
        "store-fake-ip": true
    };
    config["experimental"] = {
        "quic-go-disable-gso": false,
        "quic-go-disable-ecn": false,
        "dialer-ip4p-convert": false,
    };
    // --- ② 流量嗅探 --------------
    config["sniffer"] = {
        "enable": false,
        "force-dns-mapping": true,
        "parse-pure-ip": true,
        "override-destination": false,
        "sniff": {
            "HTTP": { "ports": [80, "8080-8880"], "override-destination": true, },
            "TLS": { "ports": [443, "5228-5230"] },
            "QUIC": { "ports": [443, 8443, "5228-5230"] }
        },
        "force-domain": ["+.v2ex.com"],
        "skip-domain": ["+.local"],
        "skip-src-address": ["192.168.0.0/16"],
        "skip-dst-address": ["192.168.0.0/16"]
    };
    // --- ③ TUN 模式 --------------
    config["tun"] = {
        "enable": true,
        "stack": "mixed",
        "dns-hijack": ["any:53"],
        "auto-route": true,
        "auto-detect-interface": true,
        "strict-route": true,
        "disable-icmp-forwarding": true,
        //"mtu": 4064,
        //"udp-timeout": 3600, // 秒
    };

    // ═══════════════════════════════════
    //   三、DNS 体系
    // ═══════════════════════════════════
    // --- ① DNS 常量模板 ----------
    const GoogleDNS = ["https://dns.google/dns-query"];
    const CloudflareDNS = ["https://cloudflare-dns.com/dns-query"];
    const 阿里DNS = ["https://dns.alidns.com/dns-query"];
    const 阿里自建 = ["quic://819431-jchlcf2024.alidns.com"];
    const 腾讯DNS = ["https://doh.pub/dns-query"];
    const 国外DNS = [
        ...CloudflareDNS.map(d => `${d}#🖥️ DNS解析`),
        ...GoogleDNS.map(d => `${d}#🖥️ DNS解析`),
    ];
    const 国内DNS = [
        //"system",
        ...阿里自建,
        ...腾讯DNS,
    ];
    config["hosts"] = {
        "dns.google": ["8.8.8.8", "8.8.4.4"],
        "cloudflare-dns.com": ["1.1.1.1", "1.0.0.1"],
        "services.googleapis.cn": "services.googleapis.com",
        "google.cn": "google.com",
        "cn.bing.com": "global.bing.com",
    };
    // --- ② DNS 模式配置 ----------
    config["dns"] = {
        "enable": true,
        "use-hosts": true,
        "use-system-hosts": true,
        "ipv6": true,
        "prefer-h3": false,
        "respect-rules": false,
        "cache-algorithm": "arc",
        "listen": "127.0.0.1:1053",
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/15",
        "fake-ip-range6": "fc00::/18",
        "fake-ip-ttl": 1,
        "fake-ip-filter-mode": "rule",
        "fake-ip-filter": [
            "RULE-SET,private,real-ip",
            "RULE-SET,connectivity-check,real-ip",
            "RULE-SET,category-ntp,real-ip",
            "RULE-SET,fakeip_filter,real-ip",
            "RULE-SET,googlefcm,real-ip",
            "RULE-SET,gfw,fake-ip",
            "RULE-SET,cn,real-ip",
            "RULE-SET,geolocation-cn,real-ip",
            "RULE-SET,geolocation-!cn,fake-ip",
            "MATCH,fake-ip"
        ],
        "proxy-server-nameserver": [
            ...阿里DNS.map(d => `${d}#disable-ipv6=false`),
        ],
        "direct-nameserver": 国内DNS,
        "direct-nameserver-follow-policy": true,
        "nameserver-policy": {
            "RULE-SET,private,googlefcm": 国内DNS,
            "RULE-SET,gfw": 国外DNS,
            "RULE-SET,cn": 国内DNS,
            "RULE-SET,geolocation-cn": 国内DNS,
            "RULE-SET,geolocation-!cn": 国外DNS,
        },
        "nameserver": 国外DNS,
    };

    // ═══════════════════════════════════
    //   四、节点筛选层
    // ═══════════════════════════════════
    // --- ① 节点正则表达式 ---------
    const 香港正则 = "(港|🇭🇰|HK|Hong|HKG)";
    const 狮城正则 = "(新|🇸🇬|坡|SG|Sing|SIN|XSP)";
    const 美国正则 = "^(?!(.*(新|流量))).*(美|🇺🇸|US|USA|加|🇨🇦|CA|JFK|LAX|ORD|ATL|DFW|SFO|MIA|SEA|IAD)";
    const 日本正则 = '(日|🇯🇵|JP|Japan|NRT|HND|KIX|CTS|FUK)';
    const 韩国正则 = '(韩|🇰🇷|韓|首尔|南朝鲜|KR|KOR|Korea)';
    const 台湾正则 = '(台|🇹🇼|TW|tai|TPE|TSA|KHH)';
    const 欧盟正则 = "^(?!(.*(马来|印度|流量))).*(奥|比|保|克罗地亚|塞|捷|丹|爱沙|芬|法|德|希|匈|爱尔|意|拉|立|卢|马其它|荷|波|葡|罗|斯洛伐|斯洛文|西|瑞|英|🇧🇪|🇨🇿|🇩🇰|🇫🇮|🇫🇷|🇩🇪|🇮🇪|🇮🇹|🇱🇹|🇱🇺|🇳🇱|🇵🇱|🇸🇪|🇬🇧|CDG|FRA|AMS|MAD|BCN|FCO|MUC|BRU|GB|FR|DE|NL|RU|LV|SE|LT|AU|NZ)";
    const 汇总正则 = `${[香港正则,狮城正则,美国正则,日本正则,韩国正则,台湾正则,欧盟正则].join("|")}`;
    // --- ② 节点列表生成 ----------
    const 香港筛选 = 内部节点.filter(n => new RegExp(香港正则, "i").test(n));
    const 狮城筛选 = 内部节点.filter(n => new RegExp(狮城正则, "i").test(n));
    const 美国筛选 = 内部节点.filter(n => new RegExp(美国正则, "i").test(n));
    const 日本筛选 = 内部节点.filter(n => new RegExp(日本正则, "i").test(n));
    const 台湾筛选 = 内部节点.filter(n => new RegExp(台湾正则, "i").test(n));
    const 韩国筛选 = 内部节点.filter(n => new RegExp(韩国正则, "i").test(n));
    const 欧盟筛选 = 内部节点.filter(n => new RegExp(欧盟正则, "i").test(n));
    const 冷门_List = 内部节点.filter(n => !new RegExp(`${汇总正则}|${节点黑名单}`, "i").test(n));
    const 全部_List = 内部节点.filter(n => !new RegExp(节点黑名单, "i").test(n));

    // ═══════════════════════════════════
    //   五、策略组体系
    // ═══════════════════════════════════
    // --- ① 代理列表模板 ----------
    const 节点选择池 = ["🇭🇰 香港节点", "🇺🇸 美国节点", "🇸🇬 狮城节点", "🇯🇵 日本节点", "🇹🇼 台湾节点", "🇰🇷 韩国节点", "🇪🇺 欧盟节点", "🌐 冷门自选", "🌐 全部节点"];
    const 故转节点池 = ["🇭🇰 香港故转", "🇺🇸 美国故转", "🇸🇬 狮城故转", "🇯🇵 日本故转"];
    const 自选节点池 = [...故转节点池, ...节点选择池];
    const 香港故转池 = ["🇭🇰 香港节点", "🇭🇰 香港自动", "🇸🇬 狮城节点", "🇯🇵 日本节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    const 狮城故转池 = ["🇸🇬 狮城节点", "🇸🇬 狮城自动", "🇭🇰 香港节点", "🇯🇵 日本节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    const 美国故转池 = ["🇺🇸 美国节点", "🇺🇸 美国自动", "🇪🇺 欧盟节点", "🇭🇰 香港节点", "🇸🇬 狮城节点", "🇯🇵 日本节点"];
    const 日本故转池 = ["🇯🇵 日本节点", "🇯🇵 日本自动", "🇭🇰 香港节点", "🇸🇬 狮城节点", "🇺🇸 美国节点", "🇪🇺 欧盟节点"];
    // --- ② 策略组定义 -----------
    config["proxy-groups"] = [
        // ▸ 主要策略组 ----------
        { name: "🖥️ 服务节点", type: "select", proxies: [...自选节点池, "🇨🇳 直连"], icon: 图标库 + "ULB.png" },
        { name: "🚀 节点选择", type: "select", proxies: ["🖥️ 服务节点", "🇨🇳 直连", ...自选节点池], icon: 图标库 + "Static.png" },
        { name: "🇨🇳 直连", type: "select", proxies: ["🎯 全球直连"], "include-all-proxies": true, filter: '🇨🇳 直连', icon: 图标库 + "China.png" },
        { name: "🇭🇰 香港故转", type: "fallback", proxies: 香港故转池, icon: 图标库 + "Hong_Kong.png", hidden: true },
        { name: "🇸🇬 狮城故转", type: "fallback", proxies: 狮城故转池, icon: 图标库 + "Singapore.png", hidden: true },
        { name: "🇺🇸 美国故转", type: "fallback", proxies: 美国故转池, icon: 图标库 + "United_States.png", hidden: true },
        { name: "🇯🇵 日本故转", type: "fallback", proxies: 日本故转池, icon: 图标库 + "Japan.png", hidden: true },
        // ▸ 自选策略组 ----------
        { name: "📹 视频平台", type: "select", proxies: ["🚀 节点选择", "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Netflix_Letter.png" },
        { name: "📲 社交媒体", type: "select", proxies: ["🚀 节点选择", "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "TikTok.png" },
        { name: "📲 电报飞机", type: "select", proxies: ["🚀 节点选择", "🖥️ 服务节点", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Telegram_X.png" },
        { name: "🎵 音乐服务", type: "select", proxies: ["🖥️ 服务节点", "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Music_Enhance.png" },
        { name: "🤖 人工智能", type: "select", proxies: ["🖥️ 服务节点", "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "ChatGPT.png" },
        { name: "🎮 game", type: "select", proxies: ["🖥️ 服务节点", "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Game.png" },
        { name: "🇬 谷歌", type: "select", proxies: ["🖥️ 服务节点", "🚀 节点选择", ...自选节点池, "🇨🇳 直连"], icon: 图标库 + "Google_Search.png" },
        { name: "🪟 Microsoft", type: "select", proxies: ["🖥️ 服务节点", "🇨🇳 直连", "🚀 节点选择", ...自选节点池], icon: 图标库 + "Microsoft.png" },
        { name: "📈 测速地址", type: "select", proxies: ["🇨🇳 直连", "🚀 节点选择", ...节点选择池], icon: 图标库 + "Speedtest.png" },
        // ▸ 固定分流组 ----------
        { name: "👨🏿‍💻 GitHub", type: "select", proxies: ["🖥️ 服务节点", "🇨🇳 直连"], icon: 图标库 + "GitHub.png", hidden: false },
        { name: "💶 PayPal", type: "select", proxies: ["🖥️ 服务节点"], icon: 图标库 + "PayPal.png", hidden: true },
        { name: "🎮 game@CN", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "Game.png", hidden: true },
        { name: "🪟 Bing", type: "select", proxies: ["🖥️ 服务节点"], icon: 图标库 + "Microsoft.png", hidden: true },
        { name: "🇬 谷歌fcm", type: "select", proxies: ["🇨🇳 直连", "PASS-RULE"], icon: 图标库 + "PostBox.png", hidden: false },
        { name: "🪟 Microsoft@CN", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "Microsoft.png", hidden: true },
        // ▸ 代理策略组 ----------
        { name: "🪜 代理域名", type: "select", proxies: ["🚀 节点选择"], icon: 图标库 + "Proxy.png", hidden: true },
        { name: "🌐 自用代理", type: "select", proxies: ["🚀 节点选择"], icon: 图标库 + "Proxy.png", hidden: true },
        { name: "⬆️ 自用直连", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "China.png", hidden: true },
        { name: "⬆️ 直连域名", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "China.png", hidden: true },
        { name: "⬆️ 直连IP", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "China.png", hidden: true },
        { name: "🔒 私有网络", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "Lock.png", hidden: true },
        // ▸ 功能策略组 ----------
        { name: "🖥️ 直连软件", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "Server.png", hidden: true },
        { name: "🖥️ 直连服务", type: "select", proxies: ["🇨🇳 直连"], icon: 图标库 + "Server.png", hidden: true },
        { name: "🖥️ 代理软件", type: "select", proxies: ["🖥️ 服务节点"], icon: 图标库 + "Server.png", hidden: true },
        { name: "🖥️ 代理服务", type: "select", proxies: ["🖥️ 服务节点"], icon: 图标库 + "Cloudflare.png", hidden: true },
        { name: "🖥️ DNS解析", type: "select", proxies: ["🖥️ 服务节点"], icon: 图标库 + "Cloudflare.png", hidden: true },
        { name: "🖥️ UDP连接", type: "select", proxies: ["PASS-RULE", "🚫 阻止"], icon: 图标库 + "Server.png" },
        { name: "🚫 广告拦截", type: "select", proxies: ["PASS", "🚫 阻止"], icon: 图标库 + "Advertising.png", hidden: false },
        { name: "🚫 追踪拦截", type: "select", proxies: ["🚫 阻止"], icon: 图标库 + "AdBlack.png", hidden: true },
        // ▸ 其他策略组 ----------
        { name: "🌐 冷门自选", type: "select", use: 外部订阅, "exclude-filter": `(?i)(${汇总正则})`, proxies: ["🈚️ 假节点", ...冷门_List], icon: 图标库 + "Bypass.png" },
        { name: "🌐 全部节点", type: "select", use: 外部订阅, proxies: ["🈚️ 假节点", ...全部_List], icon: 图标库 + "World_Map.png" },
        { name: "🐟 漏网之鱼", type: "select", proxies: ["🚀 节点选择", "🖥️ 服务节点", "🇨🇳 直连"], icon: 图标库 + "Loop.png" },
        // ▸ 生成地区组 ----------
        ...创建地区分组("🇭🇰 香港", "Hong_Kong.png", 香港筛选, `${香港正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇸🇬 狮城", "Singapore.png", 狮城筛选, `${狮城正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇺🇸 美国", "United_States.png", 美国筛选, `${美国正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇯🇵 日本", "Japan.png", 日本筛选, `${日本正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇹🇼 台湾", "Taiwan.png", 台湾筛选, `${台湾正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇰🇷 韩国", "Korea.png", 韩国筛选, `${韩国正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
        ...创建地区分组("🇪🇺 欧盟", "European_Union.png", 欧盟筛选, `${欧盟正则}`, `${"💧"}`, `${"(?!.*(家|住|直))"}`),
    ];

    // ═══════════════════════════════════
    //   六、规则体系
    // ═══════════════════════════════════
    // --- ① 规则常量定义 -----
    const classical_yaml = { type: "http", interval: 86400, behavior: "classical", format: "yaml" };
    const domain_mrs = { type: "http", interval: 86400, behavior: "domain", format: "mrs" };
    const ipcidr_mrs = { type: "http", interval: 86400, behavior: "ipcidr", format: "mrs" };
    const domain_text = { type: "http", interval: 86400, behavior: "domain", format: "text" };
    const private_url = "https://raw.githubusercontent.com/TYDMX/config-files/refs/heads/main";
    const geosite_url = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite";
    const geoip_url = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geoip";
    const BundleMRS = "geo/geosite";
    // --- ② 外部规则拉取 ---
    config["rule-providers"] = {
        // ▸ 前置规则组
        "private":              { group:"私有网络", target:"🔒 私有网络", ...domain_mrs, url:`${geosite_url}/private.mrs`, "path-in-bundle":`${BundleMRS}/private.mrs` },
        "private-ip":           { group:"私有网络", target:"🔒 私有网络", ...ipcidr_mrs, url:`${geoip_url}/private.mrs`, noResolve:true },
        "前置直连规则":          { target:"⬆️ 自用直连", ...classical_yaml, url:`${private_url}/Rule/前置直连.yaml` },
        "tracker":              { group:"追踪拦截", target:"🚫 追踪拦截", ...domain_mrs, url:`${geosite_url}/tracker.mrs`, "path-in-bundle":`${BundleMRS}/tracker.mrs` },
        "public-tracker":       { group:"追踪拦截", target:"🚫 追踪拦截", ...domain_mrs, url:`${geosite_url}/category-public-tracker.mrs`, "path-in-bundle":`${BundleMRS}/category-public-tracker.mrs` },
        "adblockmihomolite":    { group:"广告拦截", target:"🚫 广告拦截", ...domain_mrs, url:"https://raw.githubusercontent.com/217heidai/adblockfilters/refs/heads/main/rules/adblockmihomolite.mrs", "path-in-bundle":`${BundleMRS}/category-ads-all.mrs` },
        "ad-ip":                { group:"广告拦截", target:"🚫 广告拦截", ...ipcidr_mrs, url:`${geoip_url}/ad.mrs`, noResolve:true },
        "自用代理规则":          { target:"🌐 自用代理", ...classical_yaml, url:`${private_url}/Rule/自用代理.yaml` },
        "自用直连规则":          { target:"⬆️ 自用直连", ...classical_yaml, url:`${private_url}/Rule/自用直连.yaml` },
        "自用代理软件":          { target:"🖥️ 代理软件", ...classical_yaml, url:`${private_url}/Rule/代理软件.yaml` },
        "自用直连软件":          { target:"🖥️ 直连软件", ...classical_yaml, url:`${private_url}/Rule/直连软件.yaml` },
        // ▸ 直连规则组
        "games-cn":             { group:"🎮 game@CN", target:"🎮 game@CN", ...domain_mrs, url:`${geosite_url}/category-games-cn.mrs`, "path-in-bundle":`${BundleMRS}/category-games-cn.mrs` },
        "steam@cn":             { group:"🎮 game@CN", target:"🎮 game@CN", ...domain_mrs, url:`${geosite_url}/steam@cn.mrs`, "path-in-bundle":`${BundleMRS}/steam@cn.mrs` },
        "game-download":        { group:"🎮 game@CN", target:"🎮 game@CN", ...domain_mrs, url:`${geosite_url}/category-game-platforms-download.mrs`, "path-in-bundle":`${BundleMRS}/category-game-platforms-download.mrs` },
        "ookla-speedtest":      { target:"📈 测速地址", ...domain_mrs, url:`${geosite_url}/ookla-speedtest.mrs`, "path-in-bundle":`${BundleMRS}/ookla-speedtest.mrs` },
        "microsoft@cn":         { target:"🪟 Microsoft@CN", ...domain_mrs, url:`${geosite_url}/microsoft@cn.mrs`, "path-in-bundle":`${BundleMRS}/microsoft@cn.mrs` },
        "cloudflare@cn":        { group:"🖥️ 直连服务", target:"🖥️ 直连服务", ...domain_mrs, url:`${geosite_url}/cloudflare@cn.mrs`, "path-in-bundle":`${BundleMRS}/cloudflare@cn.mrs` },
        "cloudfront-ip":        { group:"🖥️ 直连服务", target:"🖥️ 直连服务", ...ipcidr_mrs, url:`${geoip_url}/cloudfront.mrs`, noResolve:true },
        "samsung":              { group:"🖥️ 直连服务", target:"🖥️ 直连服务", ...domain_mrs, url:`${geosite_url}/samsung.mrs`, "path-in-bundle":`${BundleMRS}/samsung.mrs` },
        // ▸ 代理规则组
        "games-!cn":            { target:"🎮 game", ...domain_mrs, url:`${geosite_url}/category-games-!cn.mrs`, "path-in-bundle":`${BundleMRS}/category-games-!cn.mrs` },
        "openai":               { subRule:true, pre:[quicPre("")],
                                  group:"🤖 人工智能", target:"🤖 人工智能", ...domain_mrs, url:`${geosite_url}/openai.mrs`, "path-in-bundle":`${BundleMRS}/openai.mrs` },
        "google-gemini":        { group:"🤖 人工智能", target:"🤖 人工智能", ...domain_mrs, url:`${geosite_url}/google-gemini.mrs`, "path-in-bundle":`${BundleMRS}/google-gemini.mrs` },
        "ai-!cn":               { group:"🤖 人工智能", target:"🤖 人工智能", ...domain_mrs, url:`${geosite_url}/category-ai-!cn.mrs`, "path-in-bundle":`${BundleMRS}/category-ai-!cn.mrs` },
        "spotify":              { subRule:true, pre:[quicPre("")], target:"🎵 音乐服务", ...domain_mrs, url:`${geosite_url}/spotify.mrs`, "path-in-bundle":`${BundleMRS}/spotify.mrs` },
        "paypal":               { subRule:true, pre:[quicPre("")], target:"💶 PayPal", ...domain_mrs, url:`${geosite_url}/paypal.mrs`, "path-in-bundle":`${BundleMRS}/paypal.mrs` },
        "github":               { subRule:true, pre:[quicPre("")], target:"👨🏿‍💻 GitHub", ...domain_mrs, url:`${geosite_url}/github.mrs`, "path-in-bundle":`${BundleMRS}/github.mrs` },
        "bing":                 { subRule:true, pre:[quicPre("")], target:"🪟 Bing", ...domain_mrs, url:`${geosite_url}/bing.mrs`, "path-in-bundle":`${BundleMRS}/bing.mrs` },
        "twitter":              { subRule:true, pre:[quicPre("")],
                                  group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/twitter.mrs`, "path-in-bundle":`${BundleMRS}/twitter.mrs` },
        "tiktok":               { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/tiktok.mrs`, "path-in-bundle":`${BundleMRS}/tiktok.mrs` },
        "reddit":               { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/reddit.mrs`, "path-in-bundle":`${BundleMRS}/reddit.mrs` },
        "discord":              { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/discord.mrs`, "path-in-bundle":`${BundleMRS}/discord.mrs` },
        "vk":                   { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/vk.mrs`, "path-in-bundle":`${BundleMRS}/vk.mrs` },
        "facebook":             { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/facebook.mrs`, "path-in-bundle":`${BundleMRS}/facebook.mrs` },
        "instagram":            { group:"📲 社交媒体", target:"📲 社交媒体", ...domain_mrs, url:`${geosite_url}/instagram.mrs`, "path-in-bundle":`${BundleMRS}/instagram.mrs` },
        "telegram":             { subRule:true, pre:[quicPre("")],
                                  group:"📲 电报飞机", target:"📲 电报飞机", ...domain_mrs, url:`${geosite_url}/telegram.mrs`, "path-in-bundle":`${BundleMRS}/telegram.mrs` },
        "telegram-ip":          { group:"📲 电报飞机", target:"📲 电报飞机", ...ipcidr_mrs, url:`${geoip_url}/telegram.mrs`, noResolve:true },
        "youtube":              { subRule:true, pre:[quicPre("")],
                                  group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/youtube.mrs`, "path-in-bundle":`${BundleMRS}/youtube.mrs` },
        "netflix":              { group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/netflix.mrs`, "path-in-bundle":`${BundleMRS}/netflix.mrs` },
        "twitch":               { group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/twitch.mrs`, "path-in-bundle":`${BundleMRS}/twitch.mrs` },
        "disney":               { group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/disney.mrs`, "path-in-bundle":`${BundleMRS}/disney.mrs` },
        "biliintl":             { group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/biliintl.mrs`, "path-in-bundle":`${BundleMRS}/biliintl.mrs` },
        "porn":                 { group:"📹 视频平台", target:"📹 视频平台", ...domain_mrs, url:`${geosite_url}/category-porn.mrs`, "path-in-bundle":`${BundleMRS}/category-porn.mrs` },
        "cloudflare":           { subRule:true, pre:[quicPre("")],
                                  group:"🖥️ 代理服务", target:"🖥️ 代理服务", ...domain_mrs, url:`${geosite_url}/cloudflare.mrs`, "path-in-bundle":`${BundleMRS}/cloudflare.mrs` },
        "cloudflare-ip":        { group:"🖥️ 代理服务", target:"🖥️ 代理服务", ...ipcidr_mrs, url:`${geoip_url}/cloudflare.mrs`, noResolve:true },
        "microsoft":            { target:"🪟 Microsoft", ...domain_mrs,   url:`${geosite_url}/microsoft.mrs`, "path-in-bundle":`${BundleMRS}/microsoft.mrs` },
        "google":               { subRule:true, pre:[`DST-PORT,5228-5230,🇬 谷歌fcm`, quicPre()],
                                  group:"🇬 谷歌", target:"🇬 谷歌", ...domain_mrs, url:`${geosite_url}/google.mrs`, "path-in-bundle":`${BundleMRS}/google.mrs` },
        "google-ip":            { group:"🇬 谷歌", target:"🇬 谷歌", ...ipcidr_mrs, url:`${geoip_url}/google.mrs`, noResolve:true },
        // ▸ 兜底规则组
        "category-ntp":         { target:"🖥️ 直连服务",...domain_mrs, url:`${geosite_url}/category-ntp.mrs`, "path-in-bundle":`${BundleMRS}/category-ntp.mrs` },
        "gfw":                  { subRule:true, pre:[quicPre("")],
                                  group:"🪜 代理域名", target:"🪜 代理域名", ...domain_mrs, url:`${geosite_url}/gfw.mrs`, "path-in-bundle":`${BundleMRS}/gfw.mrs` },
        "geolocation-!cn":      { group:"🪜 代理域名", target:"🪜 代理域名", ...domain_mrs, url:`${geosite_url}/geolocation-!cn.mrs`, "path-in-bundle":`${BundleMRS}/geolocation-!cn.mrs` },
        "cn":                   { group:"⬆️ 直连域名", target:"⬆️ 直连域名", ...domain_mrs, url:"https://raw.githubusercontent.com/wwqgtxx/clash-rules/refs/heads/release/direct.mrs", "path-in-bundle":`${BundleMRS}/cn.mrs` },
        "geolocation-cn":       { group:"⬆️ 直连域名", target:"⬆️ 直连域名", ...domain_mrs, url:`${geosite_url}/geolocation-cn.mrs`, "path-in-bundle":`${BundleMRS}/geolocation-cn.mrs` },
        "cn-ip":                { target:"⬆️ 直连IP", ...ipcidr_mrs, url:`${geoip_url}/cn.mrs`, noResolve:false },
        // ▸ 仅引用部分
        "connectivity-check":   { ...domain_mrs, url:`${geosite_url}/connectivity-check.mrs`, "path-in-bundle":`${BundleMRS}/connectivity-check.mrs` },
        "fakeip_filter":        { ...domain_text, url:"https://raw.githubusercontent.com/juewuy/ShellCrash/refs/heads/dev/public/fake_ip_filter.list", "path-in-bundle":`${BundleMRS}/private.mrs` },
        "googlefcm":            { ...domain_mrs, url:`${geosite_url}/googlefcm.mrs`, "path-in-bundle":`${BundleMRS}/googlefcm.mrs` },
    };
    // --- ③ 规则合成 ----------
    function quicPre(ruleSetName, target = "🖥️ UDP连接", { noResolve = false } = {}) {
        const rset = ruleSetName ? `,(RULE-SET,${ruleSetName}${noResolve ? ",no-resolve" : ""})` : "";
        return `AND,((NETWORK,UDP),(DST-PORT,443)${rset}),${target}`;
    }
    (function 合成规则列表() {
        const gMap = {};
        for (const [k, v] of Object.entries(config["rule-providers"])) {
            if (!v.group) continue;
            if (!gMap[v.group]) gMap[v.group] = { logic: v.groupLogic || "OR", target: v.target, extra: v.extra, members: [], pre: [], subRule: false };
            gMap[v.group].members.push(k);
            if (v.pre) gMap[v.group].pre.push(...v.pre);
            if (v.subRule) gMap[v.group].subRule = true;
        }
        const used = new Set();
        config["rules"] = [];
        config["sub-rules"] = {};
        for (const [name, p] of Object.entries(config["rule-providers"])) {
            if (!p.target || used.has(name)) continue;
            if (p.group) {
                const g = gMap[p.group];
                g.members.forEach(m => used.add(m));
                const parts = g.members.map(m => {
                    const mp = config["rule-providers"][m];
                    return `(RULE-SET,${m}${mp.noResolve ? ",no-resolve" : ""})`;
                });
                if (g.extra) parts.unshift(g.extra);
                if (g.subRule) {
                    const subName = `sub-${g.target}`;
                    const matchRule = `(${g.logic},(${parts.join(",")}))`;
                    config["rules"].push(`SUB-RULE,${matchRule},${subName}`);
                    const subEntry = [...g.pre, `MATCH,${g.target}`];
                    config["sub-rules"][subName] = subEntry;
                } else {
                    const groupRule = `${g.logic},(${parts.join(",")}),${g.target}`;
                    if (g.pre.length) g.pre.forEach(line => config["rules"].push(line));
                    config["rules"].push(groupRule);
                }
            } else {
                used.add(name);
                config["rules"].push(`RULE-SET,${name},${p.target}`);
            }
        }
        config["rules"].push("MATCH,🐟 漏网之鱼");
    })();

    // ═══════════════════════════════════
    //   七、工具函数
    // ═══════════════════════════════════
    // --- ① 创建地区分组 ----------
    function 创建地区分组(地区名, 地区图标, 内部地区节点池, 地区正则, 优选, 排除) {
        // 从排除正则提取排除词，生成优选池
        const 排除词匹配 = 排除.match(/\(\?!\.\*\((.+)\)\)/);
        const 排除词 = 排除词匹配 ? 排除词匹配[1] : null;
        const 内部优选节点池 = 排除词
            ? 内部地区节点池.filter(n => !new RegExp(排除词, "i").test(n))
            : 内部地区节点池;
        return [
            { name: `${地区名}节点`, type: "select", use: 外部订阅, filter: `(?i)${地区正则}`, proxies: [`${地区名}优选`, `${地区名}自动`, `${地区名}散列`, `${地区名}轮询`, ...内部地区节点池], icon: 图标库 + 地区图标 },
            { name: `${地区名}优选`, type: "url-test", use: 外部订阅, filter: `(?i)(?=.*${地区正则})(?=.*${优选})${排除}`, proxies: 内部优选节点池, hidden: true, icon: 图标库 + 地区图标, "url": 测速链接, "interval": 测速间隔, "timeout": 测速超时, "tolerance": 测速容差, "lazy": true, "empty-fallback": "REJECT-DROP" },
            { name: `${地区名}自动`, type: "url-test", use: 外部订阅, filter: `(?i)(?=.*${地区正则})`, proxies: 内部地区节点池, hidden: true, icon: 图标库 + 地区图标, "url": 测速链接, "interval": 测速间隔, "timeout": 测速超时, "tolerance": 测速容差 * 1.41, "lazy": true, "empty-fallback": "REJECT-DROP" },
            { name: `${地区名}散列`, type: "load-balance", strategy: "consistent-hashing", use: 外部订阅, filter: `(?i)(?=.*${地区正则})(?=.*${优选})${排除}`, proxies: 内部优选节点池, hidden: true, icon: 图标库 + 地区图标,"empty-fallback": "REJECT-DROP" },
            { name: `${地区名}轮询`, type: "load-balance", strategy: "round-robin", use: 外部订阅, filter: `(?i)(?=.*${地区正则})(?=.*${优选})${排除}`, proxies: 内部优选节点池, hidden: true, icon: 图标库 + 地区图标,"empty-fallback": "REJECT-DROP" }
        ];
    }

    return config;
}
