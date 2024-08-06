#//SECTION - ═════════════════════════════   1   ═════════════════════════════
clonAnchr() {
    # Navigate to the target directory
    cd $PWD
    # Clone the repository
    git clone https://github.com/muety/anchr

    # List the contents of the current directory and the cloned repository
    echo -e "${Yellow}══════════════════════════════════════════════════════════════════${Color_Off}"
    ls -l
    echo -e "${Yellow}══════════════════════════════════════════════════════════════════${Color_Off}"
    ls -l anchr
    echo -e "${Yellow}══════════════════════════════════════════════════════════════════${Color_Off}"

}
#//SECTION - ═════════════════════════════   2   ═════════════════════════════
EditDockerFile() {

    #Create Docker image with tag
    docker build -t anchr -t Devops-3 .

}
#//SECTION - ═════════════════════════════   3   ═════════════════════════════
EditDockerComposeFile() {
    #Cp Docker compose
    cp $PWD/docker-compose.yml /home/yousefakbari/anchr/docker-compose.yml

}
#//SECTION - ═════════════════════════════  Menu 0  ═════════════════════════════
# Reset
Color_Off='\033[0m' # Text Reset

# Regular Colors
Black='\033[0;30m'  # Black
Red='\033[0;31m'    # Red
Green='\033[0;32m'  # Green
Yellow='\033[0;33m' # Yellow
Blue='\033[0;34m'   # Blue
Purple='\033[0;35m' # Purple
Cyan='\033[0;36m'   # Cyan
White='\033[0;37m'  # White
# Regular Colors Function
ColorGreen() {
    echo -ne $Green$1$Color_Off
}
ColorCyan() {
    echo -ne $Cyan$1$Color_Off
}
# The main Menu function
menu() {
    # Display a banner with title
    echo -e "${Green}╔═════════════════════════════════════════════════════════════════╗${Color_Off}"
    echo -e "${Green}║                             Phase 3                             ║${Color_Off}"
    echo -e "${Green}╚═════════════════════════════════════════════════════════════════╝${Color_Off}"

    # Display options with color and spacing for readability
    echo -ne "
$(ColorGreen '1)') Clone the Anchr 

$(ColorGreen '2)') Edite DockerFile To Create Image With Tag DevOps-3

$(ColorGreen '3)') Edit hosts file 

$(ColorGreen '4)') docker compose Edit

$(ColorGreen '0)') Exit

$(ColorCyan 'Choose an option between ( 0 ~ 8 ) or press 9 to exit :') "
    read a # Prompt for user choice
    case $a in
    1)
        clonAnchr
        menu
        ;;
    2)
        ""
        menu
        ;;
    3)
        ""
        menu
        ;;
    4)
        ""
        menu
        ;;
    5)
        ""
        menu
        ;;
    6)
        ""
        menu
        ;;
    7)
        ""
        menu
        ;;
    8)
        ""
        menu
        ;;
    9)
        ""
        menu
        ;;
    10)
        ""
        menu
        ;;
    0) exit 0 ;;
    *)
        echo -e $red"Wrong option."$Color_Off
        menu
        ;;
    esac
}

# Call the menu function
menu