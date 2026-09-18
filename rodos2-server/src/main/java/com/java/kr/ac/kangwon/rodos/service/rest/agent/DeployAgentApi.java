package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.TimeUnit;

// EventHandler import removed for RODOS2

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import okhttp3.logging.HttpLoggingInterceptor.Level;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public class DeployAgentApi {
    public interface Interface {
        @POST("/image/deploy")
        Call<AgentResult> deploy(@Body DeployBody list);

        @POST("/machine/deploy")
        Call<AgentResult> execute(@Body ExecuteBody list);

        @POST("/machine/stop")
        Call<AgentResult> stop(@Body StopBody list);

        @GET("/machine/restart")
        Call<AgentResult> restart();
    }

    public static Interface getApiService(String ip) {
        return getInstance(ip).create(Interface.class);
    }

    private static Retrofit getInstance(String ip) {
        if (ip.startsWith("docker:"))
            ip = ip.split("docker:")[1];
        String url = "http://" + ip + ":9999";
        OkHttpClient.Builder builder = new OkHttpClient.Builder();
        builder.connectTimeout(600, TimeUnit.SECONDS).readTimeout(600, TimeUnit.SECONDS).writeTimeout(600,
                TimeUnit.SECONDS);
        builder.addInterceptor(chain -> {
            var request = chain.request().newBuilder().build();
            return chain.proceed(request);
        });
        var interceptor = new HttpLoggingInterceptor();
        interceptor.level(Level.BODY);
        builder.addInterceptor(interceptor);
        var retrofit = new Retrofit.Builder().addConverterFactory(GsonConverterFactory.create()).baseUrl(url)
                .client(builder.build()).build();
        return retrofit;
    }

    public static Response<AgentResult> doDeploy(String ip, DeployBody deployBody) {
        var call = getApiService(ip).deploy(deployBody);
        Response<AgentResult> response = null;
        call.enqueue(new Callback<AgentResult>() {
            @Override
            public void onResponse(Call<AgentResult> call, Response<AgentResult> response) {
                // Event handling removed for RODOS2
                System.out.println("Deploy response: " + getStatement(response));
            }

            @Override
            public void onFailure(Call<AgentResult> call, Throwable t) {
                // Event handling removed for RODOS2
                System.err.println("Deploy failed: " + getErrorStatement(deployBody, t));
            }
        });
        return response;
    }

    public static Response<AgentResult> doExecute(String ip, ExecuteBody executeBody) {
        var call = getApiService(ip).execute(executeBody);
        Response<AgentResult> response = null;
        call.enqueue(new Callback<AgentResult>() {
            @Override
            public void onResponse(Call<AgentResult> call, Response<AgentResult> response) {
                // Event handling removed for RODOS2
                System.out.println("Execute response: " + getStatement(response));
            }

            @Override
            public void onFailure(Call<AgentResult> call, Throwable t) {
                // Event handling removed for RODOS2
                System.err.println("Execute failed: " + getErrorStatement(executeBody, t));
            }
        });
        return response;
    }

    public static Response<AgentResult> doStop(String ip, StopBody stopBody) {
        var call = getApiService(ip).stop(stopBody);
        Response<AgentResult> response = null;
        call.enqueue(new Callback<AgentResult>() {
            @Override
            public void onResponse(Call<AgentResult> call, Response<AgentResult> response) {
                // Event handling removed for RODOS2
                System.out.println("Stop response: " + getStatement(response));
            }

            @Override
            public void onFailure(Call<AgentResult> call, Throwable t) {
                // Event handling removed for RODOS2
                System.err.println("Stop failed: " + getErrorStatement(stopBody, t));
            }
        });
        return response;
    }

    // 동기 호출 메서드들 추가
    public static Response<AgentResult> doExecuteSync(String ip, ExecuteBody executeBody) {
        try {
            var call = getApiService(ip).execute(executeBody);
            return call.execute(); // 동기 호출
        } catch (Exception e) {
            System.err.println("Execute sync failed: " + e.getMessage());
            return null;
        }
    }

    public static Response<AgentResult> doDeploySync(String ip, DeployBody deployBody) {
        try {
            var call = getApiService(ip).deploy(deployBody);
            return call.execute(); // 동기 호출
        } catch (Exception e) {
            System.err.println("Deploy sync failed: " + e.getMessage());
            return null;
        }
    }

    public static Response<AgentResult> doStopSync(String ip, StopBody stopBody) {
        try {
            var call = getApiService(ip).stop(stopBody);
            return call.execute(); // 동기 호출
        } catch (Exception e) {
            System.err.println("Stop sync failed: " + e.getMessage());
            return null;
        }
    }

    public static Response<AgentResult> doRestart(String ip) {
        var call = getApiService(ip).restart();
        Response<AgentResult> response = null;
        call.enqueue(new Callback<AgentResult>() {
            @Override
            public void onResponse(Call<AgentResult> call, Response<AgentResult> response) {
            }

            @Override
            public void onFailure(Call<AgentResult> call, Throwable t) {
                t.printStackTrace();
            }
        });
        return response;
    }

    private static String getErrorStatement(Object body, Throwable t) {
        String resultMessage = getSHA256String("resultMessage");

        // DeployBody, ExecuteBody, StopBody 모두 처리
        if (body instanceof DeployBody) {
            DeployBody deployBody = (DeployBody) body;
            if (deployBody.getList() != null) {
                for (var item : deployBody.getList()) {
                    resultMessage += item.getModuleName() + "Element_DELIM" + t.toString() + "Element_DELIM"
                            + item.getClusterName() + "Module_DELIM";
                }
            }
        } else if (body instanceof ExecuteBody) {
            ExecuteBody executeBody = (ExecuteBody) body;
            if (executeBody.getList() != null) {
                for (var item : executeBody.getList()) {
                    resultMessage += item.getModuleName() + "Element_DELIM" + t.toString() + "Element_DELIM"
                            + item.getClusterName() + "Module_DELIM";
                }
            }
        } else if (body instanceof StopBody) {
            StopBody stopBody = (StopBody) body;
            if (stopBody.getList() != null) {
                for (var item : stopBody.getList()) {
                    resultMessage += item.getClusterName() + "Element_DELIM" + t.toString() + "Element_DELIM"
                            + item.getClusterName() + "Module_DELIM";
                }
            }
        } else {
            resultMessage += "No ModuleElement_DELIMNO MODULEElement_DELIMNO MODULEModule_DELIM";
        }
        return resultMessage;
    }

    private static String getStatement(Response<AgentResult> response) {
        // Insert SHA-256 value of resultMessage in front of String resultMessage
        String resultMessage = getSHA256String("resultMessage");

        var result = response.body().getResult();

        for (var piece : result) {

            String moduleStatus = "";

            if (piece.getStatus().equals("fail")) {
                moduleStatus = piece.getLog().toLowerCase();
            } else {
                moduleStatus = piece.getStatus();
            }

            resultMessage += piece.getModuleName() + "Element_DELIM" + moduleStatus + "Element_DELIM"
                    + piece.getClusterName() + "Module_DELIM";
        }

        return resultMessage;
    }

    private static String getSHA256String(String input) {

        byte[] bowl;
        StringBuilder sb = new StringBuilder();

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(input.getBytes());
            bowl = md.digest();
            for (var piece : bowl) {
                sb.append(String.format("%02x", piece));
            }
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        return sb.toString();
    }
}
