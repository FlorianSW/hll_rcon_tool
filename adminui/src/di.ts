import createClient from "./http-client";
import {UserinfoService} from "./userinfo.service";
import {createContext, useContext} from "react";
import {LogsService} from "./logs.service";
import {Notifications} from "./notifications";

const fc = createClient();
const userinfoService = new UserinfoService(fc);
const logsService = new LogsService(fc);
const notifications = new Notifications();

export const services = {
    userinfoService: userinfoService,
    logsService: logsService,
    notifications: notifications,
};

const ServicesContext = createContext<typeof services>(services);
export const useServices = () => useContext(ServicesContext);
