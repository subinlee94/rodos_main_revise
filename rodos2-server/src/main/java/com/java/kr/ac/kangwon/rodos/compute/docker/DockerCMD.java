package com.java.kr.ac.kangwon.rodos.compute.docker;

import java.util.ArrayList;
import java.util.List;

public class DockerCMD {

    public static DockerRunCommandInfo parseDockerRunCommand(String dockerCommand) {

        List<String> optionsWithValues = new ArrayList<>();
        optionsWithValues.add("--name");
        optionsWithValues.add("-v");
        optionsWithValues.add("--volume");
        optionsWithValues.add("-net");
        optionsWithValues.add("--network");
        optionsWithValues.add("-e");
        optionsWithValues.add("-p");
        optionsWithValues.add("--gpus");

        // Split the Docker command
        String[] commandParts = dockerCommand.split("\\s+");

        // Initialize the lists to store options, image names, and commands
        DockerRunCommandInfo commandInfo = new DockerRunCommandInfo();
        List<String> options = new ArrayList<>();
        String imageName = null;
        List<String> commands = new ArrayList<>();

        boolean foundImageName = false;
        // Iterate through the command parts and categorize them
        for (int i = 0; i < commandParts.length; i++) {
            String part = commandParts[i];
            if (optionsWithValues.contains(part) && !foundImageName) {
                // If the part is a Docker option with a value, store it in the options list
                // along with the value
                String value = i < commandParts.length - 1 ? commandParts[i + 1] : null;
                options.add(part);
                options.add(value);
                i++; // Skip the next part, as it's the value
            } else if (part.startsWith("-") && !foundImageName) {
                // If the part is a Docker option without a value, store it in the options list
                if (part.contains("=")) {
                    String op[] = part.split("=");
                    options.add(op[0]);
                    options.add(op[1]);
                } else
                    options.add(part);
            } else if (part.contains(":") && !foundImageName) {
                // If the part contains a colon (:) assume it's an image name
                imageName = part;
                foundImageName = true;
            } else if (foundImageName) {
                // Otherwise, assume it's a command or an argument
                commands.add(part);
            }
        }

        commandInfo.options = options;
        commandInfo.imageName = imageName;
        commandInfo.cmd = commands;

        return commandInfo;
    }

    public static class DockerRunCommandInfo {
        public List<String> options;
        public String imageName;
        public List<String> cmd;
    }
}
