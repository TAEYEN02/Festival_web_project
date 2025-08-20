package com.example.festival.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "item")
public class FestivalItemDTO {

    private String title;
    private String location;
    private String eventstartdate;
    private String eventenddate;
    private String firstimage;
    private String homepage;
    private String content;
    private String id;

    @XmlElement
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    @XmlElement
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    @XmlElement(name = "eventstartdate")
    public String getEventStartDate() { return eventstartdate; }
    public void setEventStartDate(String eventstartdate) { this.eventstartdate = eventstartdate; }

    @XmlElement(name = "eventenddate")
    public String getEventEndDate() { return eventenddate; }
    public void setEventEndDate(String eventenddate) { this.eventenddate = eventenddate; }

    @XmlElement(name = "firstimage")
    public String getFirstImage() { return firstimage; }
    public void setFirstImage(String firstimage) { this.firstimage = firstimage; }

    @XmlElement(name = "homepage")
    public String getHomepage() { return homepage; }
    public void setHomepage(String homepage) { this.homepage = homepage; }

    @XmlElement(name = "content")
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    @XmlElement(name = "id")
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}
