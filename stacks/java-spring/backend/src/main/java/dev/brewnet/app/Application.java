package dev.brewnet.app;

import dev.brewnet.app.config.WebConfig;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.Context;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

public class Application {
    public static void main(String[] args) throws Exception {
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(WebConfig.class);

        DispatcherServlet servlet = new DispatcherServlet(ctx);

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        tomcat.getConnector();

        Context context = tomcat.addContext("", null);
        Tomcat.addServlet(context, "dispatcher", servlet);
        context.addServletMappingDecoded("/", "dispatcher");

        tomcat.start();
        System.out.println("Spring Framework backend listening on port 8080");
        tomcat.getServer().await();
    }
}
