package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.ArrayList;
import java.util.List;
import com.google.gson.annotations.SerializedName;

public class StopBody {
	@SerializedName("list")
	private List<StopItem> list;

	public StopBody() {
		this.list = new ArrayList<StopItem>();
	}

	public List<StopItem> getList() {
		return list;
	}

	public void setList(List<StopItem> list) {
		this.list = list;
	}

	public void append(String clusterName) {
		var item = new StopItem();
		item.setClusterName(clusterName);
		this.list.add(item);
	}
}
