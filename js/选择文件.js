//By LoyDgIk
//Time 2023/08/03
(function(){
    var requireUrl = "";
    let f = {
        getIconPath() {
            let pic= {
                TypeIconObject: {
                    ".js": "hiker://files/icon/文件类型/js.svg",
                    ".txt": "hiker://files/icon/文件类型/txt.svg",
                    ".log": "hiker://files/icon/文件类型/log.svg",
                    ".html": "hiker://files/icon/文件类型/html.svg",
                    ".apk": "hiker://files/icon/文件类型/apk.svg",
                    ".json": "hiker://files/icon/文件类型/json.svg",
                    ".css": "hiker://files/icon/文件类型/css.svg",
                    ".zip": "hiker://files/icon/文件类型/zip.svg",
                    ".hiker": "hiker://files/icon/文件类型/hiker.svg",
                    ".mp4": "hiker://files/icon/文件类型/mp4.svg",
                    ".gif": "hiker://files/icon/文件类型/gif.svg",
                    ".mp3": "hiker://files/icon/文件类型/mp3.svg"
                },
                typePic: [".svg", ".png", ".jpg"],
                defaultIcon: "hiker://files/icon/文件类型/文件.svg",
                dirIcon: "hiker://files/icon/文件类型/文件夹.svg"
            };
            const TypeIcon = new Map(Object.entries(pic.TypeIconObject));
            return{
                getIconPath:(path, type)=>{
                    return (pic.typePic.includes(type) ? path : TypeIcon.get(type)) || pic.defaultIcon;
                },
                dirIcon: pic.dirIcon
            }
        },
        loadIcon() {
            let fileSelectRoot = 'https://gitcode.net/qq_32394351/dr/-/raw/master/';
            let iconHttp = Object.entries({
                "js": fileSelectRoot + "img/文件类型/js.svg",
                "log": fileSelectRoot + "img/文件类型/log.svg",
                "html": fileSelectRoot + "img/文件类型/html.svg",
                "apk": fileSelectRoot + "img/文件类型/apk.svg",
                "json": fileSelectRoot + "img/文件类型/json.svg",
                "css": fileSelectRoot + "img/文件类型/css.svg",
                "zip": fileSelectRoot + "img/文件类型/zip.svg",
                "hiker": fileSelectRoot + "img/文件类型/hiker.svg",
                "mp4": fileSelectRoot + "img/文件类型/mp4.svg",
                "gif": fileSelectRoot + "img/文件类型/gif.svg",
                "mp3": fileSelectRoot + "img/文件类型/mp3.svg",
                "txt": fileSelectRoot + "img/文件类型/txt.svg",
                "文件": fileSelectRoot + "img/文件类型/文件.svg",
                "文件夹": fileSelectRoot + "img/文件类型/文件夹.svg"
            });
            for (let icon of iconHttp) {
                saveImage(icon[1], `hiker://files/icon/文件类型/${icon[0]}.svg`);
            }
            toast("图标加载完成");
        },
        fileSelectionUri(configs, f) {
            let url=f?"hiker://empty":"hiker://empty#noRefresh##noRecordHistory##noHistory#";
            configs.requireUrl=configs.requireUrl?configs.requireUrl:requireUrl;
            return $(url).rule((configs) => {
                let f = require(configs.requireUrl);
                f.fileSelection(configs);
            }, configs);
        },
        getId(length) {
            return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
        },
        fileSelection(MYPARAMS, d) {
            const Paths = java.nio.file.Paths;
            const Files = java.nio.file.Files;
            const Thread = java.lang.Thread;
            const load = this.init().loadFile;
            
            let configs = Object.assign({
                callback: "",   //*必填 回调函数
                fileType: "",   //pattern:0时过滤目标文件的扩展名
                pattern: 0,   //0选择文件 1选择文件夹
                onClickType: "lazyRule",    //点击弹窗方式
                cHomeTips: "确认选择[${name}]",   //onClickType:confirm时主页点击提示词
                cSearchTips: "确认选择[${path}]",   //onClickType:confirm时搜索点击提示词,
                requireUrl:requireUrl,     //*必填 该模块引用地址
                //memoryPath: false,    //是否开启记录功能(分配MyVar变量名)
                //exitSearchRefresh: false,   //退出搜索刷新列表
                initialPath: getPath("hiker://files/").slice(7),    //初始目录
                rootDirPath: getPath("hiker://files/").slice(7),   //根目录,
                //isErJi: false ,
                //isErJiPage: false,
                //notShowHide: false,
                //filePriority: false,
                //defMenu: false,
                //canCreate: false,
                //
                store:"",
            }, MYPARAMS);
            configs.initialPath = configs.initialPath||configs.rootDirPath;
            
            let {memoryPath, canCreate, initialPath} = configs;
            //delete configs.canCreate;
            
            if(!["lazyRule","confirm"].includes(configs.onClickType)) throw new Error("错误的onClickType");
            configs.uid = this.getId(6);
            if (!fileExist("hiker://files/icon/文件类型")) {
                this.loadIcon();
            }
            const colTypes = ["avatar", "icon_2", "icon_2_round", "icon_4", "icon_4_card", "icon_small_4", "icon_round_4", "icon_round_small_4", "icon_5"];
            //(function() {
            let dirPath = Paths.get(configs.rootDirPath);
            let file = dirPath.toFile();
            if (!file.exists() || !file.isDirectory()) {
                back(false);
                toast("root:不存在该文件夹["+file.getName()+"]");
                return;
            }
            let count = Number(dirPath.getNameCount());
            if(configs.memoryPath && configs.store&&!configs.isErJiPage){
                configs.initialPath = storage0.getItem(configs.store,{}).memoryPath|| configs.initialPath;
            }
            let dirPathInit = Paths.get(configs.initialPath);
            let fileInit = dirPathInit.toFile();
            if (!fileInit.exists() || !fileInit.isDirectory()) {
                //back(false);
                toast("init:不存在该文件夹["+fileInit.getName()+"]");
                configs.initialPath=configs.rootDirPath;
                //return;
            }
            let countInit = Number(dirPathInit.getNameCount());
            if(countInit < count){
                back(false);
                toast("init:count<root:count");
                return;
            }
            let data = d||[];
            //new
            data.push({
                col_type: "blank_block",
                extra: {
                    id: `${configs.uid}#变量`,
                    count: countInit,
                    currentPath: configs.initialPath
                }
            });
    
            data.push({
                title: "搜索",
                url: $.toString((configs) => {
                    input = input.trim();
                    if (input) {
                        if(input.startsWith("/")||input.startsWith("hiker://files/")){
                            let path = input.replace("hiker://files/",getPath("hiker://files/").slice(7));
                            if(!fileExist("file://"+path)){
                                return "toast://该文件(夹)不存在";
                            }
                            let load = require(configs.requireUrl).init().loadFile;
                            load(path, configs, false);
                            return "hiker://empty";
                        }
                        let isRegular = findItem(`${configs.uid}#正则`).extra.isRegular||false;
                        return $("hiker://empty#noRefresh##noRecordHistory##noHistory##fullTheme#").rule((configs, key, isRegular) => {
                            let f = require(configs.requireUrl);
                            configs.isRegular = isRegular;
                            f.search(configs, key);
                        }, configs, input, isRegular);
                    }
                }, configs),
                desc:"请输入文件名或文件路径",
                col_type: "input",
                extra: {
                    id: `${configs.uid}#搜索框1`,
                    onChange: $.toString((uid) => {
                        if (getMyVar(`${uid}:back`, "") === "true") {
                            clearMyVar(`${uid}:back`);
                            back(false);
                            return;
                        }
                    }, configs.uid),
                    configs: configs
                }
            });
            //new end
            if (configs.pattern === 1) {
                data.push({
                    title: "创建目录",
                    url: $("").input((configs) => {
                        //input = input.trim();
                        if (!input) return "toast://不支持空文件名";
                        const Paths = java.nio.file.Paths;
                        const Files = java.nio.file.Files;
                        let path = findItem(`${configs.uid}#变量`).extra.currentPath;
                        let newPath = Paths.get(path, input);
                        if (Files.exists(newPath)) {
                            return "toast://创建失败:已存在";
                        } else {
                            try {
                                Files.createDirectory(newPath);
                                let load = require(configs.requireUrl).init().loadFile;
                                load(path, configs);
                                return "toast://创建成功";
                            } catch (e) {
                                return "toast://创建失败:" + e.toString();
                            }
                        }
                    }, configs),
                    col_type: "text_2"
                });
                data.push({
                    title: "‘‘选择此文件夹’’",
                    url: $("#noLoading#").lazyRule((callback, uid) => {
                        let v = findItem(`${uid}#变量`).extra;
                        let path = v.currentPath;
                        let cls = v.itemCls;
                        let callbackFunc = new Function("PATH", "CLS", `return ${callback}`);
                        $.hiker.input = path;
                        let callbackResult = callbackFunc(path, cls);
                        if (callbackResult === true) {
                            back(false);
                            return "hiker://empty";
                        } else if (callbackResult === false) {
                            return "hiker://empty";
                        }
                        return callbackResult;
                    }, configs.callback, configs.uid),
                    col_type: "text_2"
                });
            }
            let rankMethods = ["系统", "大小", "名称", "时间"];
            let rankMethod = storage0.getItem(configs.store,{}).mname||"系统";
            let rankOrder = storage0.getItem(configs.store,{}).rankOrder||"P";
            
            for (let mname of rankMethods) {
                let a = rankMethod === mname;
                let titlea = a ? "‘‘" + mname + "’’" : mname;
                let titleb = "";
                if (a) {
                    titleb = rankOrder === "P" ? "↓" : "↑";
                }else{
                    titleb = "↕";
                }
                data.push({
                    title: titlea + titleb,
                    col_type: "flex_button",
                    url: $("#noLoading#").lazyRule((mname, configs) => {
                        let uid = configs.uid;
                        let values = findItem(`${uid}#排序变量`);
                        let rankMethod = values.title;
                        let rankOrder = values.desc;
                        let id = uid + "#rank:" + mname;
                        if (rankMethod === mname) {
                            updateItem(id, {
                                title: "‘‘" + mname + "’’" + (rankOrder !== "P" ? "↓" : "↑"),
                            });
                            updateItem(`${uid}#排序变量`, {
                                desc: rankOrder !== "P" ? "P" : "I"
                            });
                            if(configs.store){
                                let a = storage0.getItem(configs.store,{});
                                a.rankOrder = rankOrder !== "P" ? "P" : "I";
                                storage0.setItem(configs.store, a);
                            }
                        } else {
                            updateItem(id, {
                                title: "‘‘" + mname + "’’↓"
                            });
                            updateItem(uid + "#rank:" + rankMethod, {
                                title: rankMethod+"↕"
                            });
                            updateItem(`${uid}#排序变量`, {
                                title: mname,
                                desc: "P"
                            });
                            if(configs.store){
                                let a = storage0.getItem(configs.store,{});
                                a.rankOrder = "P";
                                a.mname = mname;
                                storage0.setItem(configs.store, a);
                            }
                        }
                        let load = require(configs.requireUrl).init().loadFile;
                        let basePath = findItem(`${configs.uid}#变量`).extra.currentPath;
                        load(basePath, configs)
                        return "hiker://empty";
                    }, mname, configs),
                    extra: {
                        id: configs.uid + "#rank:" + mname,
                        //mname: mname
                    }
                });
            }
            data.push({
                col_type:"line",
                desc: rankOrder,
                title: rankMethod,
                extra: {
                    id: `${configs.uid}#排序变量`
                }
            });
            let funcType = "flex_button";
            data.push({
                title: "🔍正则◎",
                col_type: funcType,
                url: $("#noLoading#").lazyRule((uid)=>{
                    let v = !!findItem(`${uid}#正则`).extra.isRegular;
                    updateItem({
                        title: "🔍正则"+["●", "◎"][Number(v)],
                        extra:{
                            id:`${uid}#正则`,
                            isRegular: !v
                        }
                    });
                    return "hiker://empty";
                }, configs.uid),
                extra: {
                    id: `${configs.uid}#正则`,
                    isRegular: false
                }
            }, {
                title: "🧩" + (storage0.getItem(configs.store,{}).colType||colTypes[0]),
                col_type: funcType,
                url: $(colTypes, 2, "选择-显示样式").select((configs)=>{
                    updateItem({
                        title: "🧩"+input,
                        extra:{
                            id: `${configs.uid}#样式`,
                            colType: input
                        }
                    });
                    let load = require(configs.requireUrl).init().loadFile;
                    let path = findItem(`${configs.uid}#变量`).extra.currentPath;
                    if(configs.store){
                        let  a = storage0.getItem(configs.store,{});
                        a.colType = input;
                        storage0.setItem(configs.store, a);
                    }
                    load(path, configs, true);
                }, configs),
                extra: {
                    id: `${configs.uid}#样式`,
                    colType: storage0.getItem(configs.store,{}).colType||colTypes[0]
                }
            });
            if(!configs.isErJiPage){
                data.push({
                    title:"🗂初始",
                    col_type: funcType,
                    url: $("#noLoading#").lazyRule(function labels(configs, firstInitialPath){
                        let load = require(configs.requireUrl).init().loadFile;
                        load(firstInitialPath, configs);
                        return "hiker://empty";
                    }, configs, initialPath)
                });
                if(canCreate){
                    data.push({
                        title:"📂创建",
                        col_type: funcType,
                        url: $(["文件夹","文件","粘贴"]).select((configs)=>{
                            let sv = findItem(`${configs.uid}#变量`);
                            let v = sv.extra;
                            let path = v.currentPath;
                            if(input==="粘贴"){
                                let source = v.clipboard||"";
                                if(!source) return "toast://剪贴板为空";
                                let isMove=source.startsWith("shear:");
                                source = source.replace("shear:","").replace("copy:","");
                                const Paths = java.nio.file.Paths;
                                const Files = java.nio.file.Files;
                                let sourcePath = Paths.get(source);
                                let fileName = sourcePath.getFileName().toString();
                                let targetPath = Paths.get(path, fileName);
                                if (Files.exists(targetPath)) {
                                    return "toast://粘贴失败:已存在";
                                }
                                try{
                                    if(isMove){
                                        Files.move(sourcePath, targetPath);
                                        sv.extra.clipboard=undefined;
                                        updateItem(sv);
                                    }else{
                                        Files.copy(sourcePath, targetPath);
                                    }
                                }catch(e){
                                    return "toast://粘贴失败:" + e.toString();
                                }
                                let load = require(configs.requireUrl).init().loadFile;
                            
                                load(path, configs, true);
                                return "toast://粘贴成功";
                            }else{
                                return $("").input((configs,path, type) => {
                                    //input = input.trim();
                                    if (!input) return "toast://不支持空文件名";
                                    const Paths = java.nio.file.Paths;
                                    const Files = java.nio.file.Files;
                                    
                                    let newPath = Paths.get(path, input);
                                    if (Files.exists(newPath)) {
                                        return "toast://创建失败:已存在";
                                    } else {
                                        try {
                                            if(type==="文件夹"){
                                                Files.createDirectory(newPath);
                                            }else{
                                                Files.createFile(newPath);
                                            }
                                            let load = require(configs.requireUrl).init().loadFile;
                                            load(path, configs);
                                            return "toast://创建成功";
                                        } catch (e) {
                                            return "toast://创建失败:" + e.toString();
                                        }
                                    }
                                }, configs, path, input)
                            }
                            
                        }, configs)
                    });
                    
                }
                data.push({
                    col_type: "blank_block"
                });
                data.push({
                    title:"🏠 ‘‘" + dirPath.getFileName() + "’’ >",
                    col_type: "scroll_button",
                    url: $("#noLoading#").lazyRule(function labels(configs, count){
                        let load = require(configs.requireUrl).init().loadFile;
                        let lastCount = findItem(`${configs.uid}#变量`).extra.count || count;
                        let del = [];
            
                        for (let i = count; i <= lastCount; i++) {
                            del.push(`${configs.uid}#路径${i}`);
                        }
                        if (del.length > 0) {
                            deleteItem(del);
                        }
                        load(""+configs.rootDirPath, configs, true);
                        return "hiker://empty";
                    }, configs, count),
                    extra: {
                        id: `${configs.uid}#路径${count-1}`
                    }
                });
            }
            /*
            data.push({
                title:"…",
                col_type:"blank_block",
                extra: {
                    id: `${configs.uid}#路径${count-1}`
                }
            });*/
            let ids = configs.filePriority?[`${configs.uid}#文件`,`${configs.uid}#文件夹`]:[`${configs.uid}#文件夹`,`${configs.uid}#文件`];
            data.push({
                col_type: "line_blank",
                extra: {
                    id: ids[0]
                }
            }, {
                col_type: "blank_block"
            }, {
                col_type: "blank_block"
            }, {
                col_type: "line_blank",
                extra: {
                    id: ids[1]
                }
            }, {
                col_type: "blank_block"
            }, {
                col_type: "blank_block"
            }, {
                col_type: "line_blank"
            }, {
                col_type:"blank_block",    
                url:"hiker://empty",
                extra: {
                    id: configs.uid + "#Bottom",
                    lineVisible: false
                }
            });
            
            setResult(data);
            Thread.sleep(50);
            load(configs);
            
            //})()
        },
        getRank(){
            let chnNumChar = {
                零: 0,
                一: 1,
                二: 2,
                三: 3,
                四: 4,
                五: 5,
                六: 6,
                七: 7,
                八: 8,
                九: 9
            };
            
            let chnNameValue = {
                十: {
                    value: 10,
                    secUnit: false
                },
                百: {
                    value: 100,
                    secUnit: false
                },
                千: {
                    value: 1000,
                    secUnit: false
                },
                万: {
                    value: 10000,
                    secUnit: true
                },
                亿: {
                    value: 100000000,
                    secUnit: true
                }
            }
            
            function ChineseToNumber(chnStr) {
                let rtn = 0;
                let section = 0;
                let number = 0;
                let secUnit = false;
                let str = chnStr.split('');
            
                for (let i = 0; i < str.length; i++) {
                    let num = chnNumChar[str[i]];
                    if (typeof num !== 'undefined') {
                        number = num;
                        if (i === str.length - 1) {
                            section += number;
                        }
                    } else {
                        let unit = chnNameValue[str[i]].value;
                        secUnit = chnNameValue[str[i]].secUnit;
                        if (secUnit) {
                            section = (section + number) * unit;
                            rtn += section;
                            section = 0;
                        } else {
                            section += (number * unit);
                        }
                        number = 0;
                    }
                }
                return rtn + section;
            }
            
            function nameCompare(a, b) {
                if (a == null || b == null)
                    return a == null ? b == null ? 0 : -1 : 1;
            
                a = a.replace(/([零一二三四五六七八九十百千万亿])/g, function(match, p1, p2, p3, offset, string) {
                    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
                    return ChineseToNumber(p1);
                })
                b = b.replace(/([零一二三四五六七八九十百千万亿])/g, function(match, p1, p2, p3, offset, string) {
                    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
                    return ChineseToNumber(p1);
                })
            
                let NUMBERS = java.util.regex.Pattern.compile("(?<=\\D)(?=\\d)|(?<=\\d)(?=\\D)")
                let split1 = NUMBERS.split(new java.lang.String(a));
                let split2 = NUMBERS.split(new java.lang.String(b));
            
                for (let i = 0; i < Math.min(split1.length, split2.length); i++) {
                    let c1 = split1[i].charCodeAt(0);
                    let c2 = split2[i].charCodeAt(0);
                    let cmp = 0;
                    let zeroCharCode = '0'.charCodeAt(0);
                    let nineCharCode = '9'.charCodeAt(0);
            
                    if (c1 >= zeroCharCode && c1 <= nineCharCode && c2 >= zeroCharCode && c2 <= nineCharCode) {
                        cmp = new java.math.BigInteger(split1[i]).compareTo(new java.math.BigInteger(split2[i]));
                    }
            
                    if (cmp === 0) {
                        let regex = /[a-zA-Z0-9]/
                        let s1 = String(split1[i])
                        let s2 = String(split2[i])
                        if (regex.test(s1) || regex.test(s2)) {
                            cmp = new java.lang.String(split1[i]).compareTo(new java.lang.String(split2[i]));
                            // cmp = s1.localeCompare(s2, 'en')
                        } else {
                            cmp = s1.localeCompare(s2, 'zh')
                        }
                    }
            
                    if (cmp !== 0) {
                        return cmp;
                    }
                }
                let lengthCmp = split1.length - split2.length;
                // if (lengthCmp !== 0) lengthCmp = lengthCmp > 0 ? -1 : 1;
                return lengthCmp;
            }
            function rank(list, m, o) {
                //let tlist=list;
                if (m === "类型") {
                    //list.sort((a, b) => a.type - b.type);
                } else if (m === "名称") {
                    list=Array.from(list).sort((a, b) => nameCompare(String(a.getName()).toUpperCase(), String(b.getName()).toUpperCase()));
                } else if (m === "大小") {
                    list=Array.from(list).sort((a, b) => a.length() - b.length());
                } else if (m === "时间") {
                    list=Array.from(list).sort((a, b) => a.lastModified() - b.lastModified());
                }
                if (o === "I") {
                    return list.reverse();
                } else {
                    return list;
                }
            }
            return rank;
        },
        getFileUtil(){
            const Paths = java.nio.file.Paths;
            const Files = java.nio.file.Files;
            const StandardCopyOption=java.nio.file.StandardCopyOption;
            const File = java.io.File;
            let exports = {}; 
            exports.renameFile = function (fromPath, name) {
                let fromFile = new File(fromPath);
                let toFile = new File(fromFile.getParent() + "/" + name);
                try {
                    if (!fromFile.exists()) {
                        return false;
                    }
                    if (toFile.exists()) {
                       // if (!deleteFlies(toPath)) {
                            return false;
                        //}
                    }
                    Files.move(fromFile.toPath(), toFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    return toFile.toString();
                } catch (e) {
                    log(e.toString());
                    return false;
                }
            }
            return exports;
        },
        init() {
            const Paths = java.nio.file.Paths;
            const Files = java.nio.file.Files;
            const StandardCopyOption=java.nio.file.StandardCopyOption;
            const File = java.io.File;
            const Thread = java.lang.Thread;
            const {dirIcon, getIconPath}=this.getIconPath();
            let $this = this;
            let exports = {};
            //const TypeIcon = new Map(Object.entries(TypeIconObject));
            function getExtension(originalFilename) {
                originalFilename = String(originalFilename);
                let i = originalFilename.lastIndexOf(".");
                if (i === -1) {
                    return "";
                }
                let suffix = originalFilename.substring(i);
                return suffix.toLowerCase();
            }
            function refreshDir(path, configs, isBack) {
                if(configs.isErJi){
                    //configs.rootDirPath=path;
                    configs.initialPath=path;
                    configs.isErJiPage=true;
                    return require(configs.requireUrl).fileSelectionUri(configs, true);
                }else{
                    let load = require(configs.requireUrl).init().loadFile;
                    load(path, configs);
                    if (isBack) {
                        back(false);
                    }
                }
                return "hiker://empty";
            }
            function choose(configs, isBack, id, menuType) {
                let choose = require(configs.requireUrl).init().choose;
                return choose(configs, isBack, id, menuType);
            }
            exports.choose=function(configs, isBack, id, menuType) {
                function click(configs, isBack, id){
                    let callbackFunc = new Function("PATH", "TYPE", "ID", `return ${configs.callback}`);
                    let v = findItem(id).extra;
                    let path = v.path, type = v.type;
                    $.hiker.input = path;
                    let callbackResult = callbackFunc(path, type, id);
                    if (callbackResult === true) {
                        if (isBack) {
                            putMyVar(`${configs.uid}:back`, "true");
                            let extra = findItem(`${configs.uid}#搜索框1`).extra;
                            updateItem({
                                extra: extra
                            });
                        }
                        back(false);
                        return "hiker://empty";
                    } else if (callbackResult === false) {
                        return "hiker://empty";
                    }
                    return callbackResult;
                }
                function menu(click, configs, isBack, id, input){
                    if(input==="打开"){
                        return click(configs, isBack, id);
                    }
                    let v = findItem(id).extra;
                    let path = v.path, type = v.type;
                    const fileUtil = com.example.hikerview.utils.FileUtil;
                    const File = java.io.File;
                    switch(input){
                        case "复制路径":
                            return "copy://"+path;
                        case "删除文件":
                            deleteFile("file://"+path);
                            deleteItem(id);
                            return "toast://已删除";
                        case "分享文件":
                            return "share://"+path;
                        case "复制":
                            var vv=findItem(`${configs.uid}#变量`);
                            var ok= "copy:"+path;
                            vv.extra.clipboard=ok;
                            updateItem(vv);
                            return "toast://已复制到剪贴板";
                        case "剪切":
                            var vv=findItem(`${configs.uid}#变量`);
                            var ok= "shear:"+path;
                            vv.extra.clipboard=ok;
                            updateItem(vv);
                            return "toast://已剪切到剪贴板";
                        case "外部打开": 
                            return "openFile://file://" + path;
                        case "文件详细":
                            try{
                                let file = new File(path);
                                return $("文件名称："+fileUtil.getFileName(path)+"\n文件大小："+fileUtil.getFormatedFileSize(fileUtil.getFolderSize(file))+"\n最后修改时间："+$.dateFormat(file.lastModified(), "yyyy/MM/dd/hh:mm:ss")).confirm(()=>{});
                            }catch(e){
                                return "toast://权限不足或获取失败"
                            }
                        case "重命名":
                            let oldName = fileUtil.getFileName(path);
                            return $(oldName,"输入新的名字").input((path, id, oldName, configs)=>{
                                if(input.trim()===""||oldName===input){
                                    return "toast://请输入新名字";
                                }
                                let code = require(configs.requireUrl);
                                try{
                                    let topath;
                                    if(!(topath=code.getFileUtil().renameFile(path, input))) return "toast://重命名失败";
                                    let extra = findItem(id).extra;
                                    extra.type = "."+com.example.hikerview.utils.FileUtil.getFileSuffix(input);
                                    extra.path = topath
                                    updateItem({
                                        title: input,
                                        pic_url: code.getIconPath().getIconPath(extra.path, extra.type),
                                        extra: extra
                                    });
                                    return "toast://改名完成";
                                } catch (e) {
                                    log(e.toString());
                                    return "toast://"+e.toString();
                                }
                            }, path, id, oldName, configs);
                    }
                }
                if(menuType){
                    return menu(click, configs, isBack, id, menuType);
                }else{
                    return click(configs, isBack, id);
                }
            }
            function findFile(baseDir, findFunc, callback, depth) {
                depth = depth || 0;
                if (!baseDir.exists() || !baseDir.isDirectory() || depth > 5) {
                    return;
                }
                let files = baseDir.listFiles();
                if(files == null){ 
                    return;
                }
                for (let file of files) {
                    let isDirectory = file.isDirectory();
                    if (findFunc(String(file.getName()))) {
                        callback(file, isDirectory);
                    }
                    if (isDirectory) {
                        findFile(file, findFunc, callback, depth + 1);
                    }
                }
            }
            function labels(path, configs, count){
                let load = require(configs.requireUrl).init().loadFile;
                let lastCount = findItem(`${configs.uid}#变量`).extra.count || count;
                let del = [];
    
                for (let i = count + 1; i <= lastCount; i++) {
                    del.push(`${configs.uid}#路径${i}`);
                }
                if (del.length > 0) {
                    deleteItem(del);
                }
                java.lang.Thread.sleep(50);
                load(path, configs, true);
                return "hiker://empty";
            }
            
            function loadTag(pathT, configs){
                let targetPath, datumPath,id;
                if(configs===undefined){
                    configs = pathT;
                    targetPath = configs.initialPath;
                    datumPath = configs.rootDirPath;
                    
                } else {
                    targetPath = pathT;
                    datumPath = findItem(`${configs.uid}#变量`).extra.currentPath;
                }
                targetPath = Paths.get(targetPath);
                datumPath = Paths.get(datumPath);
                let targetCount = targetPath.getNameCount();
                let datumCount = datumPath.getNameCount();
                let tempPath = datumPath;
                if(targetCount>=datumCount){
                for (let i = datumCount; i>0&&i <targetCount; i++) {
                    tempPath = tempPath.resolve(targetPath.getName(i));
                    addItemAfter(`${configs.uid}#路径${i-1}`, {
                        title: tempPath.getFileName() + " >",
                        col_type: "scroll_button",
                        url: $("#noLoading#").lazyRule(labels, tempPath.toString(), configs, i),
                        extra: {
                            id: `${configs.uid}#路径${i}`
                        }
                    });
                }
                }else{
                    let del=[];
                    for (let i = targetCount; i>0&&i <datumCount; i++) {
                        del.push(`${configs.uid}#路径${i}`);
                    }
                    deleteItem(del);
                }
                return targetPath;
            };
            exports.loadFile = function(path, configs, noTag) {
                let dirPath;
                if(noTag){
                    dirPath = Paths.get(path);
                }else if(configs===undefined){
                    configs = path;
                    dirPath = loadTag(configs);
                }else{
                    dirPath = loadTag(path, configs);
                }
                if(configs.memoryPath && configs.store){
                    let  a = storage0.getItem(configs.store,{});
                    a.memoryPath = dirPath.toString();
                    storage0.setItem(configs.store, a);
                }
                updateItem(configs.uid + "#Bottom", {
                    col_type: "blank_block"
                });
                //java.lang.Thread.sleep(40);
                deleteItemByCls(`${configs.uid}.文件(夹)`);
                let files;
                try{
                    files = new File(dirPath).listFiles();
                }catch(e){
                    toast("出错了");
                    return;
                }
                if(files == null){
                    toast("权限不足或获取失败");
                    return;
                }
                let values = findItem(`${configs.uid}#排序变量`)||{
                    title:"系统",
                    desc:"P"
                };
                let rankMethod = values.title;
                let rankOrder = values.desc;
                files = $this.getRank()(files, rankMethod, rankOrder)
                let wjj = [], wj = [];
                let itemCls = $this.getId(4), itemId = $this.getId(5);
                let targetType = new RegExp("("+configs.fileType+")$");
                let tips = configs.onClickType === "confirm"?configs.cHomeTips:"#noLoading#";
                let iki = 0;
                let colType;
                try{
                    colType=findItem(`${configs.uid}#样式`).extra.colType;
                }catch(e){
                    colType="avatar";
                }
                let vv=findItem(`${configs.uid}#变量`).extra;
                updateItem({
                    extra: Object.assign(vv, {
                        id: `${configs.uid}#变量`,
                        count: dirPath.getNameCount(),
                        currentPath: dirPath.toString(),
                        itemCls: itemCls
                    })
                });
                files.forEach(dirPath => {
                    let name = String(dirPath.getName());
                    let path = String(dirPath.toString());
                    let id = path||itemId+iki++;
                    if(configs.notShowHide && name.startsWith(".")){
                        return;
                    }
                    if (dirPath.isDirectory()) {
                        wjj.push({
                            title: name,
                            url: $("#noLoading#").lazyRule(refreshDir, path, configs),
                            pic_url: dirIcon,
                            col_type: colType,
                            extra: {
                                id: id,
                                path:path,
                                cls: `${configs.uid}.文件(夹) ${itemCls}`,
                                longClick:[{
                                    title: "复制路径",
                                    js: $.toString(choose, configs, false, id, "复制路径")
                                }, {
                                    title: "重命名",
                                    js: $.toString(choose, configs, false, id, "重命名")
                                }, {
                                    title: "文件详细",
                                    js: $.toString(choose, configs, false, id, "文件详细")
                                }, {
                                    title: "删除文件",
                                    js: $.toString(choose, configs, false, id, "删除文件")
                                }]
                            }
                        });
                    } else if (configs.pattern === 0) {
                        let type = getExtension(name);
                        if (configs.fileType && !targetType.test(type)) {
                            return;
                        }
                        let pic_url = getIconPath(path, type);
                        wj.push({
                            title: name,
                            url: $(tips.replace("${name}",name).replace("${path}",path))[configs.onClickType](choose, configs, false, id),
                            pic_url: pic_url,
                            col_type: colType,
                            extra: {
                                cls: `${configs.uid}.文件(夹) ${itemCls}`,
                                id: id,
                                path: path,
                                type: type,
                                longClick:[{
                                    title: "复制路径",
                                    js: $.toString(choose, configs, false, id, "复制路径")
                                }, {
                                    title: "重命名",
                                    js: $.toString(choose, configs, false, id, "重命名")
                                }, {
                                    title: "复制",
                                    js: $.toString(choose, configs, false, id, "复制")
                                }, {
                                    title: "剪切",
                                    js: $.toString(choose, configs, false, id, "剪切")
                                }, {
                                    title: "分享文件",
                                    js: $.toString(choose, configs, false, id, "分享文件")
                                }, {
                                    title: "文件详细",
                                    js: $.toString(choose, configs, false, id, "文件详细")
                                }, {
                                    title: "外部打开",
                                    js: $.toString(choose, configs, false, id, "外部打开")
                                }, {
                                    title: "删除文件",
                                    js: $.toString(choose, configs, false, id, "删除文件")
                                }]
                            }
                        });
                    }
                });
                let fa = wjj.length > 0;
                let fb = wj.length > 0;
                
                java.lang.Thread.sleep(40);
                if(configs.filePriority){
                    if (fb) {
                        addItemAfter(configs.uid + "#文件", wj);
                    }
                    if (fa) {
                        addItemAfter(configs.uid + "#文件夹", wjj);
                    }
                }else{
                    if (fa) {
                        addItemAfter(configs.uid + "#文件夹", wjj);
                    }
                    if (fb) {
                        addItemAfter(configs.uid + "#文件", wj);
                    }
                }
                java.lang.Thread.sleep(65);
                if (wjj.length>10 || wj.length>10|| wjj.length+wj.length>10) {
                    updateItem(configs.uid + "#Bottom", {
                        title: "““””<small><font color='gray'>到底了哦</font></small>",
                        col_type: "text_center_1"
                    });
                } else if(!(fa || fb)){
                    updateItem(configs.uid + "#Bottom", {
                        title: "““””<small><font color='gray'>什么都没有呢</font></small>",
                        col_type: "text_center_1"
                    });
                }
            };
            exports.loadSearch = function(key, configs) {
                deleteItemByCls(`${configs.uid}.搜索-文件夹`);
                deleteItemByCls(`${configs.uid}.搜索-文件`);
                if (key == "") return;
                let path = findItem(`${configs.uid}#变量`).extra.currentPath;
                let targetType = new RegExp("("+configs.fileType+")$");
                let wjj = [], wj = [];
                let tips = configs.onClickType === "confirm"?configs.cSearchTips:"#noLoading#";
                let itemId = $this.getId(7);
                let iki = 0;
                let colType = findItem(`${configs.uid}#样式`).extra.colType;
                if(configs.isRegular){
                    var keyReg = new RegExp(key);
                    var findFunc = (name)=>keyReg.test(name);
                }else{
                    var findFunc = (name)=>name.includes(key);
                }
                findFile(new File(path), findFunc, (file, isDirectory) => {
                    let name = String(file.getName());
                    let path = String(file.getPath());
                    if(configs.notShowHide && name.startsWith(".")){
                        return;
                    }
                    if (isDirectory) {
                        wjj.push({
                            title: name,
                            url: $("#noLoading#").lazyRule(refreshDir, path, configs, true),
                            pic_url: dirIcon,
                            col_type: colType,
                            extra: {
                                cls: `${configs.uid}.搜索-文件夹`
                            }
                        });
                    } else if (configs.pattern === 0) {
                        let type = getExtension(name);
                        if (configs.fileType && !targetType.test(type)) {
                            return;
                        }
                        let id = path||itemId+iki++;
                        let pic_url = getIconPath(path, type);
                        wj.push({
                            title: name,
                            url: $(tips.replace("${name}",name).replace("${path}",path))[configs.onClickType](choose, configs, true, id),
                            pic_url: pic_url,
                            col_type: colType,
                            extra: {
                                cls: `${configs.uid}.搜索-文件`,
                                id: id,
                                path: path,
                                type: type
                            }
                        });
                    }
                });
                Thread.sleep(50);
                if (wjj.length > 0) {
                    addItemAfter(`${configs.uid}#搜索-文件夹`, wjj);
                    //Thread.sleep(50);
                }
                if (wj.length > 0) {
                    addItemAfter(`${configs.uid}#搜索-文件`, wj);
                }
            };
            return exports;
        },
        search(configs, key) {
            let data = [];
            let basePath = findItem(`${configs.uid}#变量`).extra.currentPath;
            //new
            addListener("onClose", $.toString((path, configs)=>{
                try{
                    if(configs.exitSearchRefresh){
                        let load = require(configs.requireUrl).init().loadFile;
                        load(path, configs, true);
                    }
                }catch(e){}
            }, basePath, configs));
            data.push({
                title: "❌",
                desc: "搜索",
                url: "back(false);",
                col_type: "input",
                extra: {
                    defaultValue: key,
                    onChange: $.toString((configs) => {
                        //input = input.trim();
                        try{
                            let value1 = findItem(`${configs.uid}#搜索-变量`)||{};
                            updateItem(`${configs.uid}#搜索-变量`, {
                                desc: input,
                                url: value1.url + 1
                            });
                            java.lang.Thread.sleep(650);
                            let value2 = findItem(`${configs.uid}#搜索-变量`)||{};
                            if (value2.desc === input&&value2.desc!== value1.desc) {
                                updateItem(`${configs.uid}#搜索-状态`, {
                                    title: " ⏳““搜索中 ҉””  "
                                });
                                let load = require(configs.requireUrl).init().loadSearch;
                                load(input, configs);
                                let value3 = findItem(`${configs.uid}#搜索-变量`)||{};
                                if(value3.url!==undefined&&value3.url===value2.url){
                                    updateItem(`${configs.uid}#搜索-状态`, {
                                        title: " ⌛‘‘加载完成’’"
                                    });
                                }
                            }
                        }catch(e){}
                    }, configs)
                }
            });
            //new end
            let ids = configs.filePriority?["`${configs.uid}#搜索-文件`",`${configs.uid}#搜索-文件夹`]:[`${configs.uid}#搜索-文件夹`,`${configs.uid}#搜索-文件`];
            data.push({
                title: " ⏳““搜索中 ҉””  ",
                col_type: "text_2",
                url: "toast://搜索指示",
                extra:{
                    id: `${configs.uid}#搜索-状态`
                }
            },{
                title: "📂" + basePath.substring(basePath.lastIndexOf("/") + 1),
                col_type: "text_2",
                url: "toast://目标文件夹:" + basePath
            },{
                col_type: "blank_block"
            }, {
                col_type: "line_blank",
                extra: {
                    id: ids[0]
                }
            }, {
                col_type: "blank_block",
                url: 0,
                extra: {
                    id: `${configs.uid}#搜索-变量`
                }
            }, {
                col_type: "line_blank",
                extra: {
                    id: ids[1]
                }
            }, {
                col_type: "blank_block"
            }, {
                col_type: "line_blank"
            });
            setResult(data);
        }
    };
    if(typeof module !=="undefined"){
        requireUrl = module.modulePath;
        $.exports=f;
    }
    return f;
})()